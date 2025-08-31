import type {Any, Ctr, ModuleDescriptor, Provider, Resolver, Token,} from "./types.ts";
import {debuglog} from "../utils/debuglog.ts";
import {read, readMetadataObject, readProvider, write} from "./meta.ts";

const log = debuglog("di:injector");

const InjectorMetadata = Symbol("ModuleInjector");
const tokenName = (token: Token) =>
    (typeof token === "function" && token.name) ? token.name : String(token);

type SearchResultProvider = {
    type: "provider";
    value: Provider;
};

type SearchResultResolved = {
    type: "resolved";
    value: Any;
};

type SearchResultNotFound = {
    type: "not-found";
    value: null;
};

type SearchResult =
    | SearchResultProvider
    | SearchResultResolved
    | SearchResultNotFound;

type InjectorDescriptor = {
    providers: Provider[];
    imports: Ctr[];
};

/**
 * Dependency Injector
 * This class is responsible for resolving dependencies and managing the lifecycle of instances.
 * It implements the Resolver interface and provides methods to resolve tokens, create instances,
 * and manage providers.
 */
export class Injector implements Resolver {
    readonly name: string;
    readonly desc: InjectorDescriptor;
    readonly cache = new Map<Token, Any>();

    constructor(
        readonly ctr: Ctr,
    ) {
        const inj = read(ctr, InjectorMetadata);
        if (inj) {
            throw new Error(`Injector already set for this module.`);
        }
        const meta = readMetadataObject<ModuleDescriptor>(ctr);
        if (!meta) {
            throw new Error(`${ctr.name} is not a module`);
        }

        // normalize providers
        this.desc = {
            ...meta,
            providers: (meta.providers ?? []).map((p) =>
                (typeof p === "function") ? readProvider(p) : p
            ) as Provider[],
        };
        this.name = `${ctr.name}Injector`;
        log(`${this.name} created`);

        // set the injector instance on the module constructor
        write(ctr, InjectorMetadata, this);
    }

    /**
     * Resolve a token to its corresponding instance.
     * @param token
     * @returns Promise of the resolved instance
     */
    async resolve<T>(token: Token): Promise<T> {
        const { type, value } = await this.search(token);
        if (type === "resolved") {
            return Promise.resolve(value as T);
        }

        if (type === "provider") {
            const instance = await value.factory(this);
            this.cache.set(token, instance);
            return instance as T;
        }

        throw new Error(`${this.name}: ${tokenName(token)} not found`);
    }

    /**
     * Search for a provider by its token in the current module and its imports.
     * If not found locally, it will recursively search in imported modules.
     *
     * @param token
     * @returns SearchResult indicating whether the token was resolved, found as a provider, or not found.
     */
    async search(token: Token): Promise<SearchResult> {
        log(`${this.name} search for "${tokenName(token)}"`);

        if (this.cache.has(token)) {
            log(`${this.name} found "${tokenName(token)}" cached`);
            return {
                type: "resolved",
                value: this.cache.get(token),
            };
        }

        const provider = this.provider(token);
        if (provider) {
            log(`${this.name} found provider for "${
                tokenName(token)
            }" locally`);
            return {
                type: "provider",
                value: provider,
            };
        }

        for (const im of this.desc.imports ?? []) {
            let injector = read<Injector>(im, InjectorMetadata);
            if (!injector) {
                // if there is no injector, the
                // module has not been instantiated
                // create its injector and instantiate it
                log(`creating ${im.name} for import`);
                injector = new Injector(im);
                // add self to providers
                injector.desc.providers.push(readProvider(im) as Provider);
                await injector.resolve(im);
            }
            const res = await injector.search(token);
            if (res.type !== "not-found") {
                return res;
            }
        }
        return {
            type: "not-found",
            value: null,
        };
    }

    /**
     * Get a provider by its token.
     *
     * @param token
     * @returns Provider or undefined if not found
     */
    provider(token: Token): Provider | undefined {
        return this.desc.providers.find((p) => p.provide === token);
    }

    /**
     * Create an instance of a class with its dependencies resolved.
     *
     * @param ctr
     * @param deps
     * @returns Promise of the created instance
     */
    // async create(ctr: Ctr, deps?: Token[]): Promise<Instance> {
    //     if (!deps) {
    //         deps = getInjectable(ctr)?.deps ?? [];
    //     }
    //     const args = await Promise.all(deps.map((d) => this.resolve(d)));
    //     return Reflect.construct(ctr, args) as Instance;
    // }
}

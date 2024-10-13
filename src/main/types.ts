/**
 * Represents a class constructor that is abstract.
 */
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

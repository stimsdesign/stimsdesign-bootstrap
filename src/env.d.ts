/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        iconRegistry: Set<string>;
        spriteRegistry: Set<string>;
        logoRegistry: Set<string>;
    }
}
# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.6-10](https://github.com/SlinkyPotato/badge-buddy-api/compare/v0.0.6-9...v0.0.6-10) (2023-11-04)


### Bug Fixes

* test cases ([f81202a](https://github.com/SlinkyPotato/badge-buddy-api/commit/f81202a8b2f8727f946f51a30a3408882ad8888c))


### Refactor

* use common configs ([1383101](https://github.com/SlinkyPotato/badge-buddy-api/commit/1383101fd8485832de17e2d8384d666db2464266))

### [0.0.6-9](https://github.com/SlinkyPotato/badge-buddy-api/compare/v0.0.6-8...v0.0.6-9) (2023-11-01)


### Bug Fixes

* use PATCH /events instead of PUT /events ([25ad671](https://github.com/SlinkyPotato/badge-buddy-api/commit/25ad671ed086829d182bed12c4a8984c963f2733))


### Performance

* add additional build scripts ([28a8256](https://github.com/SlinkyPotato/badge-buddy-api/commit/28a825652491e21ba72db7da1cd4db948093aa08))


### Refactor

* improve logging for get guild ([99c56ef](https://github.com/SlinkyPotato/badge-buddy-api/commit/99c56ef68a8cdb8a3f46d6bf8404795cbfb02e94))
* remove drizzle and migrate to swc ([9fe043f](https://github.com/SlinkyPotato/badge-buddy-api/commit/9fe043f04a2c70b48a419fb5a4891ff2e8a1ae64))
* rename log to api ([00afa6f](https://github.com/SlinkyPotato/badge-buddy-api/commit/00afa6fe9ba2477dbd25d5b868a5bb2daed33ad1))
* return bot member during bot assignment ([ddecc3f](https://github.com/SlinkyPotato/badge-buddy-api/commit/ddecc3f22b29f8fc9d65997eca21a055bd199e5a))

### [0.0.6-8](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-7...v0.0.6-8) (2023-09-12)


### Bug Fixes

* add jest.config.ts to ts exclude ([fda19c6](https://github.com/solidchain-tech/badge-buddy-api/commit/fda19c6581303e3562cdbaaa3aee5ac70c70545f))

### [0.0.6-7](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-6...v0.0.6-7) (2023-09-12)


### Bug Fixes

* set default isActive to false in swagger ([3c24c1b](https://github.com/solidchain-tech/badge-buddy-api/commit/3c24c1bc9b0266458c4cc92b09dd980974943509))
* swagger for active events response ([fc4670b](https://github.com/solidchain-tech/badge-buddy-api/commit/fc4670b703683d721bdd9f5947c97c887a1b6253))


### Refactor

* import discord-events from bot ([960e052](https://github.com/solidchain-tech/badge-buddy-api/commit/960e0522579c0c6bbf0bebebe532a84222243a7b))


### Tests

* add coverage for guild-create.service.ts ([3ff76c7](https://github.com/solidchain-tech/badge-buddy-api/commit/3ff76c73b1293dbfe9ddbbc92db5eeb2d9e51ac0))
* add coverage for ready, guild-delete events ([b450aae](https://github.com/solidchain-tech/badge-buddy-api/commit/b450aaeed02c78dbbd479eb210662ed38546dcaf))
* add coverage to app module ([301ff49](https://github.com/solidchain-tech/badge-buddy-api/commit/301ff49c62e40bad06466742c8a6aee2c0e21277))
* add full coverage for discord-create ([f193e70](https://github.com/solidchain-tech/badge-buddy-api/commit/f193e7036642e22916e8dd6954bb8df5aa5c528b))
* add ready module coverage ([331dcac](https://github.com/solidchain-tech/badge-buddy-api/commit/331dcac510b8de01005b9250d32a412749700c69))
* set --verbose flag for jest test ([281436b](https://github.com/solidchain-tech/badge-buddy-api/commit/281436b975bf208a41de3cae64abcea917b10cc0))

### [0.0.6-6](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-5...v0.0.6-6) (2023-09-09)


### Refactor

* move standard-version stanza and jest config ([fc791a3](https://github.com/solidchain-tech/badge-buddy-api/commit/fc791a30a15ed6d8393d54b4825ce794f506518c))

### [0.0.6-5](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-4...v0.0.6-5) (2023-09-09)


### Refactor

* remove uneeded guildId from post guilds api ([3e47688](https://github.com/solidchain-tech/badge-buddy-api/commit/3e476889919bd63858f5fefc2d7ece6c47a82ec9))

### [0.0.6-4](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-3...v0.0.6-4) (2023-09-09)


### Bug Fixes

* docker build ([0f30707](https://github.com/solidchain-tech/badge-buddy-api/commit/0f3070721b16bf6ca9be64d9c466ab3a6b45e920))

### [0.0.6-3](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-2...v0.0.6-3) (2023-09-08)


### Bug Fixes

* disable bootstarp test unit until partial mocks work in github action ([e3c6265](https://github.com/solidchain-tech/badge-buddy-api/commit/e3c62651ff9107615e564b0fb41553c5e50bd7e3))


### Tests

* add coverage for events.service.ts ([71c95ab](https://github.com/solidchain-tech/badge-buddy-api/commit/71c95abd585b9eddd82752cd457156469f0d93b5))
* add coverage for guilds.service.ts ([3115ab4](https://github.com/solidchain-tech/badge-buddy-api/commit/3115ab4c5fd14e035ae7bdbba8bb9d0f919ff664))
* add coverage for health check ([640a306](https://github.com/solidchain-tech/badge-buddy-api/commit/640a30688ea47bf61e9bf05cb94ae8ff5c838b3f))
* add guilds api coverage ([859b090](https://github.com/solidchain-tech/badge-buddy-api/commit/859b09021a8a58f53d658c9c5f82813cab6f46e4))
* add unit test for auth guard ([7f84907](https://github.com/solidchain-tech/badge-buddy-api/commit/7f8490794744a5e099b0a6ed0c12cb5b282bdcf7))
* multiple suites ([4240379](https://github.com/solidchain-tech/badge-buddy-api/commit/424037997563c0a1bad389fad08c3590f51f355f))

### [0.0.6-2](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-1...v0.0.6-2) (2023-09-06)


### Bug Fixes

* remove ttl for processor event cache ([cdc9afc](https://github.com/solidchain-tech/badge-buddy-api/commit/cdc9afcf29c8051c590434fedc1f9371dc7b8442))


### Docs

* add some jsdocs ([50c5dc3](https://github.com/solidchain-tech/badge-buddy-api/commit/50c5dc332d22fd8f90755c706b633321cd22d21d))


### Refactor

* bump common -> 0.1.3-6 ([c60c449](https://github.com/solidchain-tech/badge-buddy-api/commit/c60c44909277f0f4ff6bbc7b59537988614683c0))
* bump common version ([e5be773](https://github.com/solidchain-tech/badge-buddy-api/commit/e5be7730da59e30f45af6f10061c5a29dd8a56ca))

### [0.0.6-1](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.6-0...v0.0.6-1) (2023-09-01)


### Bug Fixes

* use next @solidchain/badge-buddy-common ([9e733d0](https://github.com/solidchain-tech/badge-buddy-api/commit/9e733d0e350d13fcfeb1ab6b4190c7d54448ebc7))


### Performance

* update deps and use common dto for event ([d9f6253](https://github.com/solidchain-tech/badge-buddy-api/commit/d9f6253191159f8aff286e0730dde904ec05c3cd))

### [0.0.6-0](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.5...v0.0.6-0) (2023-08-31)


### Features

* track active event in cache ([03e78d0](https://github.com/solidchain-tech/badge-buddy-api/commit/03e78d0841de1d11cc41fd5c04b5e8c87af633bb))


### Bug Fixes

* add validation to get active events and allow eventId retrieval ([2128e13](https://github.com/solidchain-tech/badge-buddy-api/commit/2128e13bb8d88a6a4f7d78f8075114895a068482))
* bump @solidchain/badge-buddy-common -> 0.1.3-3 ([d69d9d5](https://github.com/solidchain-tech/badge-buddy-api/commit/d69d9d541dd914b5add245694e51e612b91b8360))


### Performance

* remove github action package.json retrieval dep ([4cb3f25](https://github.com/solidchain-tech/badge-buddy-api/commit/4cb3f25e69e7b5a39e48b1e2666976199f209ec3))
* upgrade @solidchain/badge-buddy-common ([b094587](https://github.com/solidchain-tech/badge-buddy-api/commit/b094587499c91473ca4401d48d57e6b93e9cc4d7))


### Refactor

* bump dep versions and add @jest/globals ([7348108](https://github.com/solidchain-tech/badge-buddy-api/commit/73481088289973d42ed3e4d8c4806d64c0bc6e91))
* remove github action dep for package.json ([1fb0949](https://github.com/solidchain-tech/badge-buddy-api/commit/1fb09490cffb7f617b5c01e5adaf91c6e3494d0c))

### [0.0.5](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.4...v0.0.5) (2023-08-28)


### Features

* add end event queue to end event endpoint ([1f92b90](https://github.com/solidchain-tech/badge-buddy-api/commit/1f92b9052928b43190055122f6c0db3ce14f3801))
* add producer queue to events module ([2628f70](https://github.com/solidchain-tech/badge-buddy-api/commit/2628f706541dd0af9da132e523fe0952f32e8782))


### Bug Fixes

* add exec() to events.service.ts ([f28d898](https://github.com/solidchain-tech/badge-buddy-api/commit/f28d898d37a4505bfff7910f79ea02731ba912ae))
* discord keys ([eb9f7e4](https://github.com/solidchain-tech/badge-buddy-api/commit/eb9f7e4043465eb558d585fb2e4bb018af9f1137))
* test cases for bull queue ([b3d29ec](https://github.com/solidchain-tech/badge-buddy-api/commit/b3d29ecc3637f037368dd57f510ee82486b7a022))


### Refactor

* migrate schema to common ([6e50004](https://github.com/solidchain-tech/badge-buddy-api/commit/6e50004470085591fc1f1c4fd30edae8ce6bd822))


### Performance

* upgrade node + pnpm version, enhance workflow staging notes ([9507528](https://github.com/solidchain-tech/badge-buddy-api/commit/95075286c602bd315b7cd5fc2541ce337314f678))

### [0.0.5-0](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.4...v0.0.5-0) (2023-08-28)


### Features

* add end event queue to end event endpoint ([1f92b90](https://github.com/solidchain-tech/badge-buddy-api/commit/1f92b9052928b43190055122f6c0db3ce14f3801))
* add producer queue to events module ([2628f70](https://github.com/solidchain-tech/badge-buddy-api/commit/2628f706541dd0af9da132e523fe0952f32e8782))


### Bug Fixes

* add exec() to events.service.ts ([f28d898](https://github.com/solidchain-tech/badge-buddy-api/commit/f28d898d37a4505bfff7910f79ea02731ba912ae))
* discord keys ([eb9f7e4](https://github.com/solidchain-tech/badge-buddy-api/commit/eb9f7e4043465eb558d585fb2e4bb018af9f1137))
* test cases for bull queue ([b3d29ec](https://github.com/solidchain-tech/badge-buddy-api/commit/b3d29ecc3637f037368dd57f510ee82486b7a022))


### Refactor

* migrate schema to common ([6e50004](https://github.com/solidchain-tech/badge-buddy-api/commit/6e50004470085591fc1f1c4fd30edae8ce6bd822))


### Performance

* upgrade node + pnpm version, enhance workflow staging notes ([9507528](https://github.com/solidchain-tech/badge-buddy-api/commit/95075286c602bd315b7cd5fc2541ce337314f678))

### [0.0.4](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3...v0.0.4) (2023-08-23)


### Bug Fixes

* add pnpm steps to dev ([a480936](https://github.com/solidchain-tech/badge-buddy-api/commit/a48093602fa7bde597c3a0cc9eb38b80fa95e842))
* add projects read permission ([1eed21b](https://github.com/solidchain-tech/badge-buddy-api/commit/1eed21bfa1bbef0925d335980a7cbf39bd5d3466))
* add projects write permission ([d588b3e](https://github.com/solidchain-tech/badge-buddy-api/commit/d588b3e0a856f88e23ea43e3577d809ff594899b))
* attempt prod workflow ([2988a01](https://github.com/solidchain-tech/badge-buddy-api/commit/2988a01033c6a0250c1f654b47f5900714172f11))
* enable repository-projects read across workflows ([ab393bd](https://github.com/solidchain-tech/badge-buddy-api/commit/ab393bdcf2779368533e65a5528ecfe37c02c7b1))
* pass -F flag instead of -b ([a9edd91](https://github.com/solidchain-tech/badge-buddy-api/commit/a9edd9147fd8bd4b5f14107e339eeddb1bcf9c55))
* pnpm exec of standard-version ([fd49e4e](https://github.com/solidchain-tech/badge-buddy-api/commit/fd49e4e9bdb6ef44f933fa973179ba5320211ab9))
* print changes on prs ([51390eb](https://github.com/solidchain-tech/badge-buddy-api/commit/51390eb4b593f104c471145b706c03b0686f879a))
* properly set pr title for staging ([318b2af](https://github.com/solidchain-tech/badge-buddy-api/commit/318b2af5553a901a5df38089539f3d4d4724fd2e))
* run -p in dryrun in build-dev ([86b0b08](https://github.com/solidchain-tech/badge-buddy-api/commit/86b0b08b94d638f1d08a3876fe6e95714c90df1f))
* set -F flag ([b16fa90](https://github.com/solidchain-tech/badge-buddy-api/commit/b16fa90b4dccb9dab703eadea6e648d64a46b73e))
* use --prerelease ([ede2e29](https://github.com/solidchain-tech/badge-buddy-api/commit/ede2e29964cc07e1dffe21ef702133faa8bc0276))


### Performance

* set release.md in prs ([51c62a9](https://github.com/solidchain-tech/badge-buddy-api/commit/51c62a9532b78a40cebba973b243d2d51c322fa2))

### [0.0.4-3](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.4-2...v0.0.4-3) (2023-08-23)


### Bug Fixes

* use --prerelease ([ede2e29](https://github.com/solidchain-tech/badge-buddy-api/commit/ede2e29964cc07e1dffe21ef702133faa8bc0276))

### [0.0.4-2](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.4-1...v0.0.4-2) (2023-08-23)


### Bug Fixes

* properly set pr title for staging ([318b2af](https://github.com/solidchain-tech/badge-buddy-api/commit/318b2af5553a901a5df38089539f3d4d4724fd2e))

### [0.0.4-1](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.4-0...v0.0.4-1) (2023-08-23)


### Bug Fixes

* run -p in dryrun in build-dev ([86b0b08](https://github.com/solidchain-tech/badge-buddy-api/commit/86b0b08b94d638f1d08a3876fe6e95714c90df1f))
* set -F flag ([b16fa90](https://github.com/solidchain-tech/badge-buddy-api/commit/b16fa90b4dccb9dab703eadea6e648d64a46b73e))

### [0.0.4-0](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3...v0.0.4-0) (2023-08-23)


### Bug Fixes

* add pnpm steps to dev ([a480936](https://github.com/solidchain-tech/badge-buddy-api/commit/a48093602fa7bde597c3a0cc9eb38b80fa95e842))
* add projects read permission ([1eed21b](https://github.com/solidchain-tech/badge-buddy-api/commit/1eed21bfa1bbef0925d335980a7cbf39bd5d3466))
* add projects write permission ([d588b3e](https://github.com/solidchain-tech/badge-buddy-api/commit/d588b3e0a856f88e23ea43e3577d809ff594899b))
* attempt prod workflow ([2988a01](https://github.com/solidchain-tech/badge-buddy-api/commit/2988a01033c6a0250c1f654b47f5900714172f11))
* enable repository-projects read across workflows ([ab393bd](https://github.com/solidchain-tech/badge-buddy-api/commit/ab393bdcf2779368533e65a5528ecfe37c02c7b1))
* pass -F flag instead of -b ([a9edd91](https://github.com/solidchain-tech/badge-buddy-api/commit/a9edd9147fd8bd4b5f14107e339eeddb1bcf9c55))
* pnpm exec of standard-version ([fd49e4e](https://github.com/solidchain-tech/badge-buddy-api/commit/fd49e4e9bdb6ef44f933fa973179ba5320211ab9))
* print changes on prs ([51390eb](https://github.com/solidchain-tech/badge-buddy-api/commit/51390eb4b593f104c471145b706c03b0686f879a))


### Performance

* set release.md in prs ([51c62a9](https://github.com/solidchain-tech/badge-buddy-api/commit/51c62a9532b78a40cebba973b243d2d51c322fa2))

### [0.0.3](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.2...v0.0.3) (2023-08-22)


### Bug Fixes

* add mising deps ([9b12687](https://github.com/solidchain-tech/badge-buddy-api/commit/9b12687ca05ee65116c4cb36a8dbea475075acba))
* add missing curly brace } ([bbd7c24](https://github.com/solidchain-tech/badge-buddy-api/commit/bbd7c24a9538c0d9d2d85a5bcd60965c3cd9829b))
* add missing git pull --tags ([329f003](https://github.com/solidchain-tech/badge-buddy-api/commit/329f003f3e21b03bfc1c83db6669648a8cd2d2f7))
* add missing parseChangesFile step ([b291161](https://github.com/solidchain-tech/badge-buddy-api/commit/b2911612f793f80fd6cc4fd8df6990091cd3b2d1))
* add pnpm exec ([98a5c68](https://github.com/solidchain-tech/badge-buddy-api/commit/98a5c68b3a6af97e88fc7a2151dbc05077dd036f))
* dockerignore certs folder ([8fbd418](https://github.com/solidchain-tech/badge-buddy-api/commit/8fbd4186e0a0d95ea8dbcb3ec1d1c13c6e6f1b91))
* enhance prod workflow ([3856947](https://github.com/solidchain-tech/badge-buddy-api/commit/3856947e697a01bea665b153ea1a6bdbfd66f898))
* enhance staging workflow ([2463d1f](https://github.com/solidchain-tech/badge-buddy-api/commit/2463d1fd6b6834b3821a37f4bbe377a8d0379b93))
* enhance workflow ([616ebc3](https://github.com/solidchain-tech/badge-buddy-api/commit/616ebc31d4ea81481539e02048ecdc0ed1ae076a))
* enhance workflow speed ([82bb513](https://github.com/solidchain-tech/badge-buddy-api/commit/82bb513e8586b738d112974a3025ce709fc54303))
* exclude dist in dockerignore ([e09cb9d](https://github.com/solidchain-tech/badge-buddy-api/commit/e09cb9d277dc0d3f0edaa0a30ee49bab596427f0))
* export DOTENV_KEY ([24a46e6](https://github.com/solidchain-tech/badge-buddy-api/commit/24a46e687183ad4e8f6ec7d3a5874826269ff645))
* include docker build step ([f07f913](https://github.com/solidchain-tech/badge-buddy-api/commit/f07f913bda3a19d44bd2cf60272af428e8f35063))
* include zip step ([4f1c779](https://github.com/solidchain-tech/badge-buddy-api/commit/4f1c779df60e23f5ca9288aee607040a88e60372))
* load before push in workflows ([4738199](https://github.com/solidchain-tech/badge-buddy-api/commit/4738199150cd4086d590ae9379fef62cc186e3ac))
* pull only package version for build-dev ([2fb1560](https://github.com/solidchain-tech/badge-buddy-api/commit/2fb156015ecc0e7c58943469319976253e547450))
* reduce dev workflow build ([3ae1634](https://github.com/solidchain-tech/badge-buddy-api/commit/3ae16346cec20e1635e11a2b414f82b934837adb))
* remove double quotes ([4b1cbde](https://github.com/solidchain-tech/badge-buddy-api/commit/4b1cbde847c990d0001f715e309c8db77de6a284))
* set release text ([c16f385](https://github.com/solidchain-tech/badge-buddy-api/commit/c16f385a79583ad29c093a740192960abd91f996))
* simplify workflow ([1abf2f2](https://github.com/solidchain-tech/badge-buddy-api/commit/1abf2f2c297c63063ef237f1a2fbf1071c62d4a6))
* sync deps to common ([525f1db](https://github.com/solidchain-tech/badge-buddy-api/commit/525f1db65b7b6c3a67a3a3aa89775d054a866f39))
* test workflow ([4e8ae71](https://github.com/solidchain-tech/badge-buddy-api/commit/4e8ae71907a743c343c4ba62f739134dcf08233c))
* try caching docker pnpm pull ([fed9bdf](https://github.com/solidchain-tech/badge-buddy-api/commit/fed9bdfa341d3d50f2062be7530917e0a53d401f))
* try pnpm cache ([4fbb553](https://github.com/solidchain-tech/badge-buddy-api/commit/4fbb553c3fa210525afc67322568fe23be79d75d))
* type in release.md ([a996140](https://github.com/solidchain-tech/badge-buddy-api/commit/a996140a82e6ea1736e7d30b62eeeec983a5a91d))
* update to latest common ([efc9305](https://github.com/solidchain-tech/badge-buddy-api/commit/efc930577c1b7cedcc8868583c2ea7473530205f))
* use correct @solidchain/badge-buddy-common ([69bd98a](https://github.com/solidchain-tech/badge-buddy-api/commit/69bd98aa7533749f141346e734891f4598c9cbb5))


### Tests

* remove console ([5bc1df4](https://github.com/solidchain-tech/badge-buddy-api/commit/5bc1df42d9a0b8571acbd490c8e7bd24aa19cd30))
* run remove test ([c3c086f](https://github.com/solidchain-tech/badge-buddy-api/commit/c3c086f8dd8dc38fcaed943f49b28430d3d4216a))
* run test ([c555455](https://github.com/solidchain-tech/badge-buddy-api/commit/c555455e691d86f4739bec7198ec30a9ac28cc10))


### Docs

* rename build-dev ([ea284ce](https://github.com/solidchain-tech/badge-buddy-api/commit/ea284ceba1e4450886649adee11d453d4d3b69aa))


### Performance

* enhance prod workflow to use pnpm cache ([5db881a](https://github.com/solidchain-tech/badge-buddy-api/commit/5db881acf2da717a631b7a6c97bbc69696c2095f))
* enhance staging and production workflows ([f3530b3](https://github.com/solidchain-tech/badge-buddy-api/commit/f3530b307e732d626d8a895da46278de28b2b1d1))
* ignore .github foler ([f1dd012](https://github.com/solidchain-tech/badge-buddy-api/commit/f1dd01273009a2b3e7dd9e73f059ac24858b69bf))
* only copy dist folder during docker build ([056f683](https://github.com/solidchain-tech/badge-buddy-api/commit/056f683d629fa10cac2ff11c53d8f6d98dc671da))
* only install @solidchain/badge-buddy-common ([6118329](https://github.com/solidchain-tech/badge-buddy-api/commit/61183291920ca53f38b863461d9f8154ac045b02))
* reduce docker build time ([dba1866](https://github.com/solidchain-tech/badge-buddy-api/commit/dba18666a4340b5a1bfd487252333cb829b7b4f5))
* remove package.json step for build-dev ([4a2b274](https://github.com/solidchain-tech/badge-buddy-api/commit/4a2b274db57e1299963aaf2d17c1723a4141cab0))
* remove uneeded git pull tag step ([a0fa939](https://github.com/solidchain-tech/badge-buddy-api/commit/a0fa93929b24fd8ba728939f8b4af45ae2969cfb))
* use caching in docker builds ([6174d55](https://github.com/solidchain-tech/badge-buddy-api/commit/6174d5528ffd8bcc65033ca8d2e363598dcd764d))

### [0.0.3-13](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-12...v0.0.3-13) (2023-08-22)


### Bug Fixes

* type in release.md ([a996140](https://github.com/solidchain-tech/badge-buddy-api/commit/a996140a82e6ea1736e7d30b62eeeec983a5a91d))

### [0.0.3-12](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-11...v0.0.3-12) (2023-08-22)

### [0.0.3-11](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-10...v0.0.3-11) (2023-08-22)

### [0.0.3-10](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-9...v0.0.3-10) (2023-08-22)

### [0.0.3-9](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-8...v0.0.3-9) (2023-08-22)


### Bug Fixes

* include zip step ([4f1c779](https://github.com/solidchain-tech/badge-buddy-api/commit/4f1c779df60e23f5ca9288aee607040a88e60372))


### Performance

* only install @solidchain/badge-buddy-common ([6118329](https://github.com/solidchain-tech/badge-buddy-api/commit/61183291920ca53f38b863461d9f8154ac045b02))

### [0.0.3-8](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-7...v0.0.3-8) (2023-08-22)


### Bug Fixes

* add missing parseChangesFile step ([b291161](https://github.com/solidchain-tech/badge-buddy-api/commit/b2911612f793f80fd6cc4fd8df6990091cd3b2d1))
* use correct @solidchain/badge-buddy-common ([69bd98a](https://github.com/solidchain-tech/badge-buddy-api/commit/69bd98aa7533749f141346e734891f4598c9cbb5))


### Docs

* rename build-dev ([ea284ce](https://github.com/solidchain-tech/badge-buddy-api/commit/ea284ceba1e4450886649adee11d453d4d3b69aa))


### Performance

* enhance prod workflow to use pnpm cache ([5db881a](https://github.com/solidchain-tech/badge-buddy-api/commit/5db881acf2da717a631b7a6c97bbc69696c2095f))
* remove uneeded git pull tag step ([a0fa939](https://github.com/solidchain-tech/badge-buddy-api/commit/a0fa93929b24fd8ba728939f8b4af45ae2969cfb))

### [0.0.3-7](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-6...v0.0.3-7) (2023-08-22)


### Bug Fixes

* add missing curly brace } ([bbd7c24](https://github.com/solidchain-tech/badge-buddy-api/commit/bbd7c24a9538c0d9d2d85a5bcd60965c3cd9829b))


### Performance

* remove package.json step for build-dev ([4a2b274](https://github.com/solidchain-tech/badge-buddy-api/commit/4a2b274db57e1299963aaf2d17c1723a4141cab0))

### [0.0.3-6](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-5...v0.0.3-6) (2023-08-22)


### Bug Fixes

* dockerignore certs folder ([8fbd418](https://github.com/solidchain-tech/badge-buddy-api/commit/8fbd4186e0a0d95ea8dbcb3ec1d1c13c6e6f1b91))
* exclude dist in dockerignore ([e09cb9d](https://github.com/solidchain-tech/badge-buddy-api/commit/e09cb9d277dc0d3f0edaa0a30ee49bab596427f0))
* include docker build step ([f07f913](https://github.com/solidchain-tech/badge-buddy-api/commit/f07f913bda3a19d44bd2cf60272af428e8f35063))
* test workflow ([4e8ae71](https://github.com/solidchain-tech/badge-buddy-api/commit/4e8ae71907a743c343c4ba62f739134dcf08233c))
* try caching docker pnpm pull ([fed9bdf](https://github.com/solidchain-tech/badge-buddy-api/commit/fed9bdfa341d3d50f2062be7530917e0a53d401f))


### Tests

* remove console ([5bc1df4](https://github.com/solidchain-tech/badge-buddy-api/commit/5bc1df42d9a0b8571acbd490c8e7bd24aa19cd30))
* run remove test ([c3c086f](https://github.com/solidchain-tech/badge-buddy-api/commit/c3c086f8dd8dc38fcaed943f49b28430d3d4216a))
* run test ([c555455](https://github.com/solidchain-tech/badge-buddy-api/commit/c555455e691d86f4739bec7198ec30a9ac28cc10))


### Performance

* enhance staging and production workflows ([f3530b3](https://github.com/solidchain-tech/badge-buddy-api/commit/f3530b307e732d626d8a895da46278de28b2b1d1))
* ignore .github foler ([f1dd012](https://github.com/solidchain-tech/badge-buddy-api/commit/f1dd01273009a2b3e7dd9e73f059ac24858b69bf))
* only copy dist folder during docker build ([056f683](https://github.com/solidchain-tech/badge-buddy-api/commit/056f683d629fa10cac2ff11c53d8f6d98dc671da))
* reduce docker build time ([dba1866](https://github.com/solidchain-tech/badge-buddy-api/commit/dba18666a4340b5a1bfd487252333cb829b7b4f5))
* use caching in docker builds ([6174d55](https://github.com/solidchain-tech/badge-buddy-api/commit/6174d5528ffd8bcc65033ca8d2e363598dcd764d))

### [0.0.3-5](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-4...v0.0.3-5) (2023-08-22)

### [0.0.3-4](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-3...v0.0.3-4) (2023-08-22)


### Bug Fixes

* remove double quotes ([4b1cbde](https://github.com/solidchain-tech/badge-buddy-api/commit/4b1cbde847c990d0001f715e309c8db77de6a284))

### [0.0.3-3](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-2...v0.0.3-3) (2023-08-22)


### Bug Fixes

* export DOTENV_KEY ([24a46e6](https://github.com/solidchain-tech/badge-buddy-api/commit/24a46e687183ad4e8f6ec7d3a5874826269ff645))

### [0.0.3-2](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.3-1...v0.0.3-2) (2023-08-22)


### Bug Fixes

* add missing git pull --tags ([329f003](https://github.com/solidchain-tech/badge-buddy-api/commit/329f003f3e21b03bfc1c83db6669648a8cd2d2f7))

### 0.0.3-1 (2023-08-22)

### 0.0.3-0 (2023-08-21)

### [0.0.2](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.2-0...v0.0.2) (2023-08-18)

### [0.0.2-0](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.1-2...v0.0.2-0) (2023-08-18)

### [0.0.1](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.1-1...v0.0.1) (2023-08-18)

### [0.0.1](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.1-1...v0.0.1) (2023-08-18)

### [0.0.1-2](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.1-1...v0.0.1-2) (2023-08-18)


### Bug Fixes

* workflow docker name ([46dcaf2](https://github.com/solidchain-tech/badge-buddy-api/commit/46dcaf2c3b70975ef156b96df7ac05909a36ec44))

### [0.0.1-1](https://github.com/solidchain-tech/badge-buddy-api/compare/v0.0.1-0...v0.0.1-1) (2023-08-18)


### Bug Fixes

* compose.yml next reference ([7f8d60f](https://github.com/solidchain-tech/badge-buddy-api/commit/7f8d60f589d000a52cf5894c02e0f7f986f22318))

### 0.0.1-0 (2023-08-18)


### Features

* add /health endpoint ([6b27a53](https://github.com/solidchain-tech/badge-buddy-api/commit/6b27a534b51429cecbee1f73c50aa6d445446eaf))
* add auth to events endpoint ([7ba0363](https://github.com/solidchain-tech/badge-buddy-api/commit/7ba0363d97cc3913bd56465939dfb836d80591a7))
* add HEALTHCHECK docker ([fafee8e](https://github.com/solidchain-tech/badge-buddy-api/commit/fafee8ed61aeb73f41c3d9ae917a1f8fa829dcf7))
* add PUT /event stop endpoint ([508cd16](https://github.com/solidchain-tech/badge-buddy-api/commit/508cd16e624bf84869887c8a70ebf47b544ebcfd))
* add validation to mongo env var ([f337923](https://github.com/solidchain-tech/badge-buddy-api/commit/f337923b385b5a826f46b5bf96ef0a11ed2eef2c))
* enable caching for GET /events/active ([61173d0](https://github.com/solidchain-tech/badge-buddy-api/commit/61173d0b01ffdc5a038989782841bad95d6bd429))
* enhance configuration files ([a2ee72a](https://github.com/solidchain-tech/badge-buddy-api/commit/a2ee72a95aa9e1326d45a62ef2cb066cb5f95ee8))
* implement GET /events/active endpoint ([e71807e](https://github.com/solidchain-tech/badge-buddy-api/commit/e71807e2728fcd0e5e175529295b407707a5c8f2))
* implement PUT /events to stop tracking ([ddfd962](https://github.com/solidchain-tech/badge-buddy-api/commit/ddfd962a16090a7344d3e719384b2bb9ec6c2746))
* integrate Logtail (betterstack) ([a3b6664](https://github.com/solidchain-tech/badge-buddy-api/commit/a3b6664322c299b59d84690da57d0e2f4f71533b))
* introduce /events/active endpoint ([92e16ae](https://github.com/solidchain-tech/badge-buddy-api/commit/92e16aef3996cc4d0f51b42588263995b7f53261))


### Bug Fixes

* .github action path variable ([b3217f9](https://github.com/solidchain-tech/badge-buddy-api/commit/b3217f982b2ad51776abc599ebde736a968a0482))
* add .iml to .gitignore ([3c6db4e](https://github.com/solidchain-tech/badge-buddy-api/commit/3c6db4ebeb9fc2a239f95b8f1d29c9bf9f8bd9aa))
* add missing \ in HEALTHCHECK ([9b24e0c](https://github.com/solidchain-tech/badge-buddy-api/commit/9b24e0c8610cf8d877b1d83c3aec15dc4b536124))
* adjust HEALTHCHECK options ([185c3a9](https://github.com/solidchain-tech/badge-buddy-api/commit/185c3a983c00f39755fc21dd3d06b97727ef95f0))
* adjust HEALTHCHECK options ([f798818](https://github.com/solidchain-tech/badge-buddy-api/commit/f7988182f41eaf18bf780f161824ad84a48610ac))
* adjust redis path ([6d7e318](https://github.com/solidchain-tech/badge-buddy-api/commit/6d7e318f2de74d60325b2d08efdebf30ffb67645))
* adjust redis path ([e691e31](https://github.com/solidchain-tech/badge-buddy-api/commit/e691e310280c15a22fe5f56723dca06195a98d28))
* all the spec unit tests ([7b4b256](https://github.com/solidchain-tech/badge-buddy-api/commit/7b4b256c5f5083c54a5d17933cf0a4003b3741a9))
* del cache on event start and stop ([eb290c5](https://github.com/solidchain-tech/badge-buddy-api/commit/eb290c5680ae0ba597b496a659d46fa2c52bda67))
* drop ignored foler ([d528347](https://github.com/solidchain-tech/badge-buddy-api/commit/d5283470de6e8a8b1cc3984677b7c7f520d21027))
* enhance HEALTHCHECK intervals ([2fe71de](https://github.com/solidchain-tech/badge-buddy-api/commit/2fe71de96635a76eca21cd9bd0795e481ed7c913))
* enhance HEALTHCHECK intervals ([720976a](https://github.com/solidchain-tech/badge-buddy-api/commit/720976a273abb8507c2ca962333137fbb6191373))
* enhance logging message for auth guard ([aead2cb](https://github.com/solidchain-tech/badge-buddy-api/commit/aead2cb594a19c011ad4b25a95ee3c2ea1444aee))
* package.json name and readme ([7a1ba15](https://github.com/solidchain-tech/badge-buddy-api/commit/7a1ba1504d11090f0268906dd65e4f9b81b7026d))
* pino logger and implement logger service ([9446489](https://github.com/solidchain-tech/badge-buddy-api/commit/9446489c10c7f7aac9ff774821cfe103f12dd98e))
* remove $ from docker build ([0729868](https://github.com/solidchain-tech/badge-buddy-api/commit/07298682bc84478c959d71df63857ef886cc044f))
* remove build args ([8f71887](https://github.com/solidchain-tech/badge-buddy-api/commit/8f71887267374c52764ed54aeedd8197e5de485a))
* set changelog to blank ([05ae1b9](https://github.com/solidchain-tech/badge-buddy-api/commit/05ae1b9f638672cbc64974c2fb867cce6ae6c5c3))
* set package version to initial 0.0.0 ([ec4f107](https://github.com/solidchain-tech/badge-buddy-api/commit/ec4f10714d1157549b33080512d1eb3f5fece3be))
* set start period to 3s ([e0384d1](https://github.com/solidchain-tech/badge-buddy-api/commit/e0384d1b4d0173fc9bf7a420263ec097097711f9))
* small change ([6447dab](https://github.com/solidchain-tech/badge-buddy-api/commit/6447dabd02ceb6d8698e846d42e8f8178b983c1f))
* small formatting ([583e9fb](https://github.com/solidchain-tech/badge-buddy-api/commit/583e9fb825a18e05b7add8fc7139491458a2b55d))
* upgrade common repo ([e2373b1](https://github.com/solidchain-tech/badge-buddy-api/commit/e2373b1b9c5c25d9b7cd5227cea3c8b252995f4b))
* upgrade workflows ([12efe0f](https://github.com/solidchain-tech/badge-buddy-api/commit/12efe0fbea178fdffe1912a4966c97b27db523c7))
* use common logging ([0ba3ffa](https://github.com/solidchain-tech/badge-buddy-api/commit/0ba3ffa93e8ded6d3816390fefd258cd1430e06b))
* use correct logTail tokens ([04d8f36](https://github.com/solidchain-tech/badge-buddy-api/commit/04d8f36a6928f78f286df48d47b9a67c083b70e8))
* use dotenv key variable ([097048e](https://github.com/solidchain-tech/badge-buddy-api/commit/097048eb752a9bfae1cfa4d67ca0dc731bc80091))

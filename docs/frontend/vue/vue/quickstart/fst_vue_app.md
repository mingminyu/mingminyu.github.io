# 第一个 Vue 应用

前面已经介绍过如何创建一个 Vue 应用，本篇文章我们解读下项目结构以及代码，帮助我们进一步了解 Vue 的使用。

## 1. 创建项目

使用 `npm create vue@latest` 来创建项目，跟随 Vite 提示输如项目信息。

```bash
$ npm create vue@latest
Need to install the following packages:
create-vue@3.10.4
Ok to proceed? (y)


> npx
> create-vue

Vue.js - The Progressive JavaScript Framework

✔ Project name: … hello_vue
✔ Add TypeScript? … No / Yes
✔ Add JSX Support? … No / Yes
✔ Add Vue Router for Single Page Application development? … No / Yes
✔ Add Pinia for state management? … No / Yes
✔ Add Vitest for Unit Testing? … No / Yes
✔ Add an End-to-End Testing Solution? › No
✔ Add ESLint for code quality? … No / Yes
✔ Add Vue DevTools 7 extension for debugging? (experimental) … No / Yes

Scaffolding project in tutorials/learn_vue/hello_vue...

Done. Now run:

  cd hello_vue
  npm install
  npm run dev
```

过程中会先安装 `create-vue` 工具，项目构建完成后提示如何安装依赖以及运行程序。

## 2. 项目结构

项目的文件结构如下所示，其中高亮位置为执行 `npm install` 命令完成后的目录或文件。

```bash linenums="1" hl_lines="5-7" title="项目结构"
hello_vue/
├── README.md
├── env.d.ts
├── index.html
├── node_modules/
│   └── ...
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── src/
│   ├── App.vue
│   ├── assets
│   │   ├── base.css
│   │   ├── logo.svg
│   │   └── main.css
│   ├── components
│   │   ├── HelloWorld.vue
│   │   ├── TheWelcome.vue
│   │   ├── WelcomeItem.vue
│   │   └── icons
│   │       ├── IconCommunity.vue
│   │       ├── IconDocumentation.vue
│   │       ├── IconEcosystem.vue
│   │       ├── IconSupport.vue
│   │       └── IconTooling.vue
│   └── main.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

???+ note "文件或目录说明"

    === "整体说明"

        - node_modules: 项目依赖库
        - package-lock.json: 执行 `npm install` 时候生成的一份文件，用于记录当前状态下实际安装的各个npm package 的具体来源和版本号
        - package.json: 项目开发所需要的模块，版本，项目名称
        - src: 存放 Vue 文件
            - App.vue: 项目主 Vue 组件，所有页面都是在 App.vue 下进行切换的
            - assets: 存放静态文件，例如图片
            - compoents: 存放公共组件，即非路由组件
            - main.ts: 程序入口文件，主要作用是初始化 Vue 实例，同时可以在此文件中引用某些组件库或者全局挂载一些变量。
        - tsconfig.json: TypeScript 配置文件
        - vite.config.ts: Vite 配置文件

        使用 `npm run build` 命令打包后，项目根目录下还会出现 ./dist 目录。

    === "vite.config.ts"

        ```ts linenums="1"
        import { fileURLToPath, URL } from 'node:url'

        import { defineConfig } from 'vite'
        import vue from '@vitejs/plugin-vue'

        // https://vitejs.dev/config/
        export default defineConfig({
          plugins: [
            vue(),
          ],
          resolve: {
            alias: {
              '@': fileURLToPath(new URL('./src', import.meta.url))
            }
          }
        })
        ```

    === "tsconfig.*.json"

        ```json linenums="1" title="tsconfig.app.json"
        {
          "extends": "@vue/tsconfig/tsconfig.dom.json",
          "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
          "exclude": ["src/**/__tests__/*"],
          "compilerOptions": {
            "composite": true,
            "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

            "baseUrl": ".",
            "paths": {
              "@/*": ["./src/*"]
            }
          }
        }
        ```

        ```json linenums="1" title="tsconfig.node.json"
        {
          "extends": "@tsconfig/node20/tsconfig.json",
          "include": [
            "vite.config.*",
            "vitest.config.*",
            "cypress.config.*",
            "nightwatch.conf.*",
            "playwright.config.*"
          ],
          "compilerOptions": {
            "composite": true,
            "noEmit": true,
            "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",

            "module": "ESNext",
            "moduleResolution": "Bundler",
            "types": ["node"]
          }
        }
        ```

        ```json linenums="1" title="tsconfig.json"
        {
          "files": [],
          "references": [
            {
              "path": "./tsconfig.node.json"
            },
            {
              "path": "./tsconfig.app.json"
            }
          ]
        }
        ```

    === "package.json"

        ```json linenums="1"
        {
          "name": "hello_vue",
          "version": "0.0.0",
          "private": true,
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "run-p type-check \"build-only {@}\" --",
            "preview": "vite preview",
            "build-only": "vite build",
            "type-check": "vue-tsc --build --force"
          },
          "dependencies": {
            "vue": "^3.4.29"
          },
          "devDependencies": {
            "@tsconfig/node20": "^20.1.4",
            "@types/node": "^20.14.5",
            "@vitejs/plugin-vue": "^5.0.5",
            "@vue/tsconfig": "^0.5.1",
            "npm-run-all2": "^6.2.0",
            "typescript": "~5.4.0",
            "vite": "^5.3.1",
            "vue-tsc": "^2.0.21"
          }
        }
        ```
    
    === "App.Vue"

        ```html linenums="1"
        <script setup lang="ts">
        import HelloWorld from './components/HelloWorld.vue'
        import TheWelcome from './components/TheWelcome.vue'
        </script>

        <template>
          <header>
            <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

            <div class="wrapper">
              <HelloWorld msg="You did it!" />
            </div>
          </header>

          <main>
            <TheWelcome />
          </main>
        </template>

        <style scoped>
        header {
          line-height: 1.5;
        }

        .logo {
          display: block;
          margin: 0 auto 2rem;
        }

        @media (min-width: 1024px) {
          header {
            display: flex;
            place-items: center;
            padding-right: calc(var(--section-gap) / 2);
          }

          .logo {
            margin: 0 2rem 0 0;
          }

          header .wrapper {
            display: flex;
            place-items: flex-start;
            flex-wrap: wrap;
          }
        }
        </style>
        ```

    === "components/icons/*.vue"

        ??? example

            ```html linenums="1" title="HelloWorld.vue"
            <script setup lang="ts">
            defineProps<{
              msg: string
            }>()
            </script>

            <template>
              <div class="greetings">
                <h1 class="green">{{ msg }}</h1>
                <h3>
                  You’ve successfully created a project with
                  <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
                  <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
                </h3>
              </div>
            </template>

            <style scoped>
            h1 {
              font-weight: 500;
              font-size: 2.6rem;
              position: relative;
              top: -10px;
            }

            h3 {
              font-size: 1.2rem;
            }

            .greetings h1,
            .greetings h3 {
              text-align: center;
            }

            @media (min-width: 1024px) {
              .greetings h1,
              .greetings h3 {
                text-align: left;
              }
            }
            </style>
            ```

        ??? example "TheWelcome.vue"

            ```html linenums="1"
            <script setup lang="ts">
            import WelcomeItem from './WelcomeItem.vue'
            import DocumentationIcon from './icons/IconDocumentation.vue'
            import ToolingIcon from './icons/IconTooling.vue'
            import EcosystemIcon from './icons/IconEcosystem.vue'
            import CommunityIcon from './icons/IconCommunity.vue'
            import SupportIcon from './icons/IconSupport.vue'
            </script>

            <template>
              <WelcomeItem>
                <template #icon>
                  <DocumentationIcon />
                </template>
                <template #heading>Documentation</template>

                Vue’s
                <a href="https://vuejs.org/" target="_blank" rel="noopener">official documentation</a>
                provides you with all information you need to get started.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <ToolingIcon />
                </template>
                <template #heading>Tooling</template>

                This project is served and bundled with
                <a href="https://vitejs.dev/guide/features.html" target="_blank" rel="noopener">Vite</a>. The
                recommended IDE setup is
                <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VSCode</a> +
                <a href="https://github.com/johnsoncodehk/volar" target="_blank" rel="noopener">Volar</a>. If
                you need to test your components and web pages, check out
                <a href="https://www.cypress.io/" target="_blank" rel="noopener">Cypress</a> and
                <a href="https://on.cypress.io/component" target="_blank" rel="noopener"
                  >Cypress Component Testing</a
                >.

                <br />

                More instructions are available in <code>README.md</code>.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <EcosystemIcon />
                </template>
                <template #heading>Ecosystem</template>

                Get official tools and libraries for your project:
                <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Pinia</a>,
                <a href="https://router.vuejs.org/" target="_blank" rel="noopener">Vue Router</a>,
                <a href="https://test-utils.vuejs.org/" target="_blank" rel="noopener">Vue Test Utils</a>, and
                <a href="https://github.com/vuejs/devtools" target="_blank" rel="noopener">Vue Dev Tools</a>. If
                you need more resources, we suggest paying
                <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">Awesome Vue</a>
                a visit.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <CommunityIcon />
                </template>
                <template #heading>Community</template>

                Got stuck? Ask your question on
                <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>, our official
                Discord server, or
                <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener"
                  >StackOverflow</a
                >. You should also subscribe to
                <a href="https://news.vuejs.org" target="_blank" rel="noopener">our mailing list</a> and follow
                the official
                <a href="https://twitter.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
                twitter account for latest news in the Vue world.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <SupportIcon />
                </template>
                <template #heading>Support Vue</template>

                As an independent project, Vue relies on community backing for its sustainability. You can help
                us by
                <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">becoming a sponsor</a>.
              </WelcomeItem>
            </template>

            ```
        
        ??? example "WelcomeItem.vue"

            ```html linenums="1"
            <script setup lang="ts">
            import WelcomeItem from './WelcomeItem.vue'
            import DocumentationIcon from './icons/IconDocumentation.vue'
            import ToolingIcon from './icons/IconTooling.vue'
            import EcosystemIcon from './icons/IconEcosystem.vue'
            import CommunityIcon from './icons/IconCommunity.vue'
            import SupportIcon from './icons/IconSupport.vue'
            </script>

            <template>
              <WelcomeItem>
                <template #icon>
                  <DocumentationIcon />
                </template>
                <template #heading>Documentation</template>

                Vue’s
                <a href="https://vuejs.org/" target="_blank" rel="noopener">official documentation</a>
                provides you with all information you need to get started.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <ToolingIcon />
                </template>
                <template #heading>Tooling</template>

                This project is served and bundled with
                <a href="https://vitejs.dev/guide/features.html" target="_blank" rel="noopener">Vite</a>. The
                recommended IDE setup is
                <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VSCode</a> +
                <a href="https://github.com/johnsoncodehk/volar" target="_blank" rel="noopener">Volar</a>. If
                you need to test your components and web pages, check out
                <a href="https://www.cypress.io/" target="_blank" rel="noopener">Cypress</a> and
                <a href="https://on.cypress.io/component" target="_blank" rel="noopener"
                  >Cypress Component Testing</a
                >.

                <br />

                More instructions are available in <code>README.md</code>.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <EcosystemIcon />
                </template>
                <template #heading>Ecosystem</template>

                Get official tools and libraries for your project:
                <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Pinia</a>,
                <a href="https://router.vuejs.org/" target="_blank" rel="noopener">Vue Router</a>,
                <a href="https://test-utils.vuejs.org/" target="_blank" rel="noopener">Vue Test Utils</a>, and
                <a href="https://github.com/vuejs/devtools" target="_blank" rel="noopener">Vue Dev Tools</a>. If
                you need more resources, we suggest paying
                <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">Awesome Vue</a>
                a visit.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <CommunityIcon />
                </template>
                <template #heading>Community</template>

                Got stuck? Ask your question on
                <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>, our official
                Discord server, or
                <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener"
                  >StackOverflow</a
                >. You should also subscribe to
                <a href="https://news.vuejs.org" target="_blank" rel="noopener">our mailing list</a> and follow
                the official
                <a href="https://twitter.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
                twitter account for latest news in the Vue world.
              </WelcomeItem>

              <WelcomeItem>
                <template #icon>
                  <SupportIcon />
                </template>
                <template #heading>Support Vue</template>

                As an independent project, Vue relies on community backing for its sustainability. You can help
                us by
                <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">becoming a sponsor</a>.
              </WelcomeItem>
            </template>
            ```

## 3. 打包



# Leo Director web
레오 서비스의 디렉터들이 사용하는 일반관제, 통합관제를 제공하는 웹 클라이언트입니다.
## 가이드
[R&D 코딩 컨벤션 - Client seed conding convention](https://www.notion.so/barogohq/Coding-Convention-f411b58d5e81443fb764658abaef3b2d#bb37484a7d514594838b46dbb48231e3)
[공식 Vue2 가이드](https://vuejs.org/v2/guide/index.html)
[공식 Vue Router 가이드 - 한글](https://router.vuejs.org/kr/guide/)
[공식 Vuex 가이드 - 한글](https://vuex.vuejs.org/kr/)
[공식 Vue Style 가이드](https://vuejs.org/v2/style-guide/)
[공식 Vue-cli-plugin-apollo(graphql) 가이드](https://vue-cli-plugin-apollo.netlify.app/)
[공식 Vue Apollo 가이드](https://apollo.vuejs.org/)
[공식 Apollo Client(React) 가이드](https://www.apollographql.com/docs/react/)
[R&D 공식 UI Framework - Vuetify 홈](https://vuetifyjs.com/en/)
[Vue 교육자료 - Vuemastery 사내교육](https://www.notion.so/barogohq/VueMastery-685fd879fabb4683bd4fd2a6338907a2)
[Vue i18n(Localization)](https://kazupon.github.io/vue-i18n/introduction.html)
## 디렉토리 구조
[R&D 프론트개발 공통 컨벤션](https://www.notion.so/barogohq/1074-R-D-9a71bef1eea54723a7b42b4011a632a1)을 토대로 작성
```
director/
|- build (vue-cli에서 참조하는 webpack 설정파일. 각 스테이지마다 설정을 다르게 할 수 있음.)
|- nginx (nginx 서버설정 파일)
|- public (클라이언트에서 참조할 수 있는 정적 리소스. 이미지, favicon, 최초진입하는 html 페이지 등)
|- src (Vue 소스코드)
   |- assets (Vue component 내부에서 바로 참조할 수 있는 정적 리소스)
   |- components (재사용이 가능한 Vue component들. 페이지로 사용되는 Vue component들의 하위 구성요소로 사용됨.)
   |- lib (공용으로 사용하는 3rd party libarary 및 utils 객체 및 메서드를 관리)
      |- axios (Axios client 초기화 로직)
      |- constants (모든 상수는 이곳으로 모읍니다)
      |- graphql (Apollo clinet 초기화 로직)
      |- locales (i18n 언어별 설정 모음)
      |- socket (socketio client 초기화 로직)
      |- utils (유틸성 3rd party library 및 메서드들)
   |- plugins (Vue에서 전역적으로 사용할 모듈은 플러그인으로 만들어 이곳에서 관리합니다. Vuetify, Vue-i18n 등)      
   |- mixins (재사용이 가능한 Vue component의 메서드들의 모듈)
   |- router (URL이 가리키는 주소와 페이지를 맵핑)
   |- services (서버와 통신하기 위한 서비스 레이어)
      |- graphql
         |- mutation(mutation 관련 gql 파일은 이곳으로 모음)
         |- query(query 관련 gql파일은 이곳으로 모음)
         |- index.js
      |- rest
         |- auth.js(서비스별로 모듈 파일을 작성)
         |- index.js
   |- store (Vuex로 Global state가 관리되는 모듈. 이를 이용해서 모든 페이지에서 같은 데이터를 참조할 수 있다.)
      |- delivery(데이터 별로 모듈 파일들을 작성)
         |- actions.js
         |- getters.js
         |- mutations.js
         |- state.js
         |- index.js
      |- index.js
   |- styles (scss 스타일 파일들)
   |- views (router에서 맵핑된 페이지를 나타내는 Vue component들)
      |- ${view} (특정 페이지 관련 컴포넌트 모음)
         |- layouts (페이지 내부의 레이아웃)
   |- App.vue (Single Page Application를 시작하기 위해 로딩하는 최상위 Vue component)
   |- main.js (App.vue를 최초로 진입하는 index.html에서 구동시켜주는 스크립트 파일)
|- tests (테스트코드 모음)
|- .eslintignore (eslint 제외 파일 및 디렉토리)
|- .eslintrc (eslint 설정파일)
|- babel.config.js (babel 컴파일 설정 파일)
|- Dockerfile (Docker compose 설정 파일)
|- jest.config.js (jest 테스트 설정 파일)
|- package.json (외부 패키지 관리파일)
|- READMD.md (개발 가이드 문서)
|- vue.config.js (vue-cli로 구동되는 webpack의 설정을 연동해주는 파일)
|- yarn.lock (외부 패키지 의존성을 yarn으로 관리해주는 파일)
```
## 개발 컨벤션
### Vue.js component 네이밍은 PascalCase
[근거: Component name casing in templates](https://vuejs.org/v2/style-guide/#Component-name-casing-in-templates-strongly-recommended)
## 개발환경구성
### Vue.js devtools
[chrome 웹 스토어 - Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

### Socket과 Store의 흐름
[Socket과 Store의 흐름](https://www.notion.so/barogohq/Socket-Store-5036c8d01be449c48780de3988da702d)

## Data flow(데이터의 흐름)
- Flux의 기본 철학인 One way data flow(단방향 데이터 흐름)을 준수합니다. [Flux overview](https://facebook.github.io/flux/docs/in-depth-overview)
-  데이터 조회가 필요한 경우(graphql의 경우)
   - Vue component -> @/store/${모듈}/Actions -> @/services/${리소스} -> @/lib/graphql/apolloClient 의 흐름으로 연결됩니다.
## FAQ
### 1. app initialize 의 주체
작성해주세요!
### 2. route 구조
작성해주세요!
### 3. component를 나누는 단위
작성해주세요!
### 4. 하위 component에서 상위 component에 이벤트발생 혹은 데이터변경이 일어날 경우, state관리 혹은 그외 다른방법?
작성해주세요!

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Run your unit tests

```
yarn test:unit
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### Vue cli의 Webpack의 구조

- Vue cli에서 기본적으로 가지고 있는 Webpack 설정을 제외한 필요한 기능만 설정파일로 만들었습니다. 기존 Webpack.config.js 대비 설정 파일의 갯수(8개 -> 5개)와 크기가 줄었습니다.

### Webpack의 기본 실행 모드

1. production (Vue cli의 기본 모드)
   ```
   $ yarn build
   ```
2. staging (사용자 설정 모드)
   ```
   $ yarn serve:staging
   ```
3. development (Vue cli의 기본 모드)
   ```
   $ yarn serve
   ```
4. local (사용자 설정 모드)
   ```
   $ yarn serve:local
   ```

### Webpack의 설정 변경이 필요하다면? (관련 설명링크는 주석으로 첨부)

1. production, staging, development
   - webpack.config.js
   - webpack.dev.config.js
   - webpack.staging.config.js
   - webpack.prod.config.js
2. local
   - webpack.local.config.js

### Webpack에서 정의한 상수를 어플리케이션에서 사용하려면?

```
## webpack.local.config.js, webpack.dev.config.js, webpack.staging.config.js, webpack.prod.config.js
configureWebpack: {
    plugins: [
        new webpack.DefinePlugin({
            "process.env.${key}":'"${value}"'
        })
    ]
}
```

```
## 어플리케이션 코드 ex) main.js
console.log(process.env[`${key}`]); // ${value}를 출력
```

참고 [Webpack - DefinePlugin](https://webpack.js.org/plugins/define-plugin/)

### Vue cli + Webpack config

[vue.config.js](https://cli.vuejs.org/config/#vue-config-js)
[configureWebpack](https://cli.vuejs.org/config/#configurewebpack)

### Vue cli + Deployment

[Deployment](https://cli.vuejs.org/guide/deployment.html#docker-nginx)

### eslint-plugin-jest (테스트 코드에 대한 eslint 검사)

[Github](https://github.com/jest-community/eslint-plugin-jest#readme)

### [Profiling]번들링된 전체 파일 중에 어떤 파일이 큰지 알아보려면?

```
## webpack.config.js

// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin; // 주석을 해제
...
configureWebpack: {
    plugins: [
        ...
        // new BundleAnalyzerPlugin() // 주석을 해제
    ]
}
```

```
$ yarn build
```

<img src="https://miro.medium.com/max/1559/1*Tzo7ki8deVX0ADRFCm1E7Q.png" width="640">

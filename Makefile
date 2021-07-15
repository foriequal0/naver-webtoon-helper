.PHONY: build
build: webext-build

.PHONY: lint
lint: eslint prettier webext-lint

.PHONY: fix
fix: fix-eslint fix-prettier

.PHONY: sign
sign: webext-build
	$$(npm bin)/web-ext sign --artifacts-dir artifacts/ --source-dir dist/


.PHONY: webpack-build
webpack-build: npm
	NODE_ENV=production $$(npm bin)/webpack

.PHONY: webext-build
webext-build: npm webpack-build
	$$(npm bin)/web-ext build --overwrite-dest --artifacts-dir artifacts/ --source-dir dist/

.PHONY: archive
archive:
	mkdir artifacts/
	git archive --format=tar.gz --prefix=naver-webtoon-helper/ -o artifacts/naver-webtoon-helper.src.tar.gz HEAD

.PHONY: webext-lint
webext-lint: npm build
	$$(npm bin)/web-ext lint --source-dir dist


.PHONY: eslint
eslint: npm
	$$(npm bin)/eslint --max-warnings 0 './**/*.ts'

.PHONY: fix-eslint
fix-eslint: npm
	$$(npm bin)/eslint --fix './**/*.ts'

.PHONY: prettier
prettier: npm
	$$(npm bin)/prettier --check .

.PHONY: fix-prettier
fix-prettier: npm
	$$(npm bin)/prettier --write .


.PHONY: npm
npm: node_modules

node_modules: package-lock.json
	npm ci --include=dev

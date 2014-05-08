SRC := $(wildcard *.js)
DEV_SRC := $(wildcard test/*.js)

build: build/azure_table.js

build/build.dev.js: $(SRC) $(DEV_SRC)
	./node_modules/.bin/component build -d -n build.dev

build/azure_table.js: $(SRC)
	@./node_modules/.bin/component build \
		-s AzureTable \
		-n azure_table

.PHONY: clean
clean:
	rm -fr build

.PHONY: server
server:
	@echo "Starting dev server"
	node test/server.js

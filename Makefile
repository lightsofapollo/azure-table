build/azure_table: client.js
	@./node_modules/.bin/component build \
		-s AzureTable \
		-n azure_table

.PHONY: clean
clean:
	rm -fr build


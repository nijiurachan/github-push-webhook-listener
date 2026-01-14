.PHONY: all format check test

NPM=bun

all: format check test
	@echo See README.md for installation instructions

format:
	$(NPM) run $@

check:
	$(NPM) run $@

test:
	$(NPM) $@

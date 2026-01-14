.PHONY: all format check

NPM=bun

all: format check
	@echo See README.md for installation instructions

format:
	$(NPM) run $@

check:
	$(NPM) run $@

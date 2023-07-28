#
# Project
#
package-lock.json:	package.json
	npm install
	touch $@
node_modules:		package-lock.json
	npm install
	touch $@
build:			node_modules

use-local-agent-client:
	cd tests; npm uninstall @spartan-hc/holochain-agent-client
	cd tests; npm install --save ../../holochain-agent-client-js/
use-npm-agent-client:
	cd tests; npm uninstall @spartan-hc/holochain-agent-client
	cd tests; npm install --save @spartan-hc/holochain-agent-client

use-local-admin-client:
	cd tests; npm uninstall @spartan-hc/holochain-admin-client
	cd tests; npm install --save-dev ../../holochain-admin-client-js/
use-npm-admin-client:
	cd tests; npm uninstall @spartan-hc/holochain-admin-client
	cd tests; npm install --save-dev @spartan-hc/holochain-admin-client

use-local-backdrop:
	cd tests; npm uninstall @spartan-hc/holochain-backdrop
	cd tests; npm install --save-dev ../../node-holochain-backdrop/
use-npm-backdrop:
	cd tests; npm uninstall @spartan-hc/holochain-backdrop
	cd tests; npm install --save-dev @spartan-hc/holochain-backdrop


#
# Testing
#
test:			build test-setup test-unit test-integration
test-debug:		build test-setup test-unit-debug test-integration-debug
test-unit:		build test-setup
	LOG_LEVEL=warn npx mocha ./tests/unit
test-unit-debug:	build test-setup
	LOG_LEVEL=trace npx mocha ./tests/unit

test-integration:	build test-setup
	LOG_LEVEL=warn npx mocha ./tests/integration
test-integration-debug:	build test-setup
	LOG_LEVEL=trace npx mocha ./tests/integration
test-setup:		tests/storage.happ

tests/storage.happ:	../zome-mere-memory/packs/app/Storage.happ
	cp $< $@


#
# Repository
#
clean-remove-chaff:
	@find . -name '*~' -exec rm {} \;
clean-files:		clean-remove-chaff
	git clean -nd
clean-files-force:	clean-remove-chaff
	git clean -fd
clean-files-all:	clean-remove-chaff
	git clean -ndx
clean-files-all-force:	clean-remove-chaff
	git clean -fdx


#
# NPM
#
prepare-package:
	rm -f dist/*
	npx webpack
	MODE=production npx webpack
	gzip -kf dist/*.js
preview-package:	clean-files test prepare-package
	npm pack --dry-run .
create-package:		clean-files test prepare-package
	npm pack .
publish-package:	clean-files test prepare-package
	npm publish --access public .

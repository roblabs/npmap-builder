# NPMap Builder

NPMap Builder (from hereon referred to as "Builder") is a graphical interface that can be used to build maps with the [NPMap.js library](https://github.com/nationalparkservice/npmap.js). Builder is intended to be a quick start for developing and deploying maps to the web. It is not intended to cover every use case - and it never will. Those who want to add advanced functionality or customizations to their map will need to use NPMap.js's [API](http://www.nps.gov/npmap/tools/npmap.js/docs/).

That said, output from Builder should provide a good base starting point for all maps - even those that require additional customizations.

## Build

You can create a production build with minified and combined JavaScript and CSS by using Grunt:

1. Install Node
2. `npm install`
3. `grunt`

The build will be created in the `_site` directory.

## Status

NPMap Builder is a work-in-progress. Consider the code alpha and the feature set incomplete.

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.

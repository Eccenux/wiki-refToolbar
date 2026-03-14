import { DeployConfig } from 'wikiploy';

/**
 * Add config.
 * @param {Array} configs DeployConfig array.
 * @param {String} site Domian of a MW site.
 */
export function addConfig(configs, site, isRelease) {
	let deploymentName = isRelease ? 'MediaWiki:Gadget-refToolbar' : '~/refToolbar';
	configs.push(new DeployConfig({
		src: 'refToolbar.js',
		dst: `${deploymentName}.js`,
		site,
		nowiki: false,
	}));
	configs.push(new DeployConfig({
		src: 'refToolbar.css',
		dst: `${deploymentName}.css`,
		site,
	}));
}
export function addConfigRelease(configs, site) {
	addConfig(configs, site, true);
}

const is = require('./is');

module.exports = function(hostname) {
    if (!is('string', hostname)) return null;

    const parts = hostname.split('.');

    const domain = parts.splice(-2, 2);

    const domainExt = domain[1].replace(/[\#|\/].*/, '');

    return {
        ext: domainExt,
        domainName: domain[0],
        fullDomain: `${domain[0]}.${domainExt}`,
        subdomains: (parts.length === 0) ? null : parts,
    }
}
// Complete polyfill for Node.js 'path' module for browser environments
// This prevents errors when libraries try to use Node.js built-ins

export const parse = (pathString: string) => {
    if (!pathString || typeof pathString !== 'string') {
        return { root: '', dir: '', base: '', ext: '', name: '' };
    }
    return {
        root: '',
        dir: '',
        base: pathString,
        ext: '',
        name: pathString
    };
};

export const basename = (pathString: string) => {
    if (!pathString || typeof pathString !== 'string') return '';
    return pathString.split('/').pop() || pathString.split('\\').pop() || pathString;
};

export const dirname = (pathString: string) => {
    if (!pathString || typeof pathString !== 'string') return '.';
    const parts = pathString.split('/');
    parts.pop();
    return parts.join('/') || '.';
};

export const extname = (pathString: string) => {
    if (!pathString || typeof pathString !== 'string') return '';
    const base = pathString.split('/').pop() || pathString.split('\\').pop() || pathString;
    const dotIndex = base.lastIndexOf('.');
    return dotIndex > 0 ? base.substring(dotIndex) : '';
};

export const join = (...paths: any[]) => {
    if (!paths || paths.length === 0) return '.';
    const validPaths = paths.filter((p) => p != null && typeof p === 'string' && p.length > 0);
    if (validPaths.length === 0) return '.';
    return validPaths.join('/').replace(/\/+/g, '/');
};

export const resolve = (...paths: any[]) => {
    if (!paths || paths.length === 0) return '.';
    const validPaths = paths.filter((p) => p != null && typeof p === 'string' && p.length > 0);
    if (validPaths.length === 0) return '.';
    return validPaths.join('/').replace(/\/+/g, '/');
};

export const normalize = (pathString: string) => {
    if (!pathString || typeof pathString !== 'string') return '.';
    return pathString.replace(/\/+/g, '/');
};

export const isAbsolute = (pathString: string) => {
    if (!pathString || typeof pathString !== 'string') return false;
    return pathString.startsWith('/');
};

export const relative = (from: string, to: string) => {
    if (!to || typeof to !== 'string') return '.';
    return to;
};

export const sep = '/';
export const delimiter = ':';

export default {
    parse,
    basename,
    dirname,
    extname,
    join,
    resolve,
    normalize,
    isAbsolute,
    relative,
    sep,
    delimiter
};

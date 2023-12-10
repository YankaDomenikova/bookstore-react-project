(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
    typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError'; 
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError'; 
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError'; 
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError'; 
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError'; 
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError'; 
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }), {});
        const body = await parseBody(req);

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }
    		
    		if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {
                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = '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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: '';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch('/' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get('data');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get('data/' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get('util/throttle');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post('util', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class=\"collection-list\">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set(['_id']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from '//unpkg.com/page/page.mjs';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector('main');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\r\n    let viewer = html`<div class=\"col\">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class=\"layout\">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class=\"layout\">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k,v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
         function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
    	users: {
    		"35c62d76-8152-4626-8712-eeb96381bea8": {
    			email: "peter@abv.bg",
    			username: "Peter",
    			hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
    		},
    		"847ec027-f659-4086-8032-5173e2f9c93a": {
    			email: "george@abv.bg",
    			username: "George",
    			hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
    		},
    		"60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
    			email: "admin@abv.bg",
    			username: "Admin",
    			hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
    		}
    	},
    	sessions: {
    	}
    };
    var seedData = {
        categories: {
            "d9e9296e-c2ef-48df-b5b6-3df05e99ace0": {
                name: "Romance",
                _id: "d9e9296e-c2ef-48df-b5b6-3df05e99ace0",
            },
            "e5f56f1e-5631-48a1-8fc5-9f374424306f": {
                name: "Horror",
                _id: "e5f56f1e-5631-48a1-8fc5-9f374424306f",
            },
            "8d04c99d-a900-4440-8d67-64ead7e2298f": {
                name: "Mystery, Thrillers, & Crime",
                _id: "8d04c99d-a900-4440-8d67-64ead7e2298f"
            },
            "3ba68fc3-fc14-40c9-8de6-33a936cba1ad": {
                name: "Manga",
                _id: "3ba68fc3-fc14-40c9-8de6-33a936cba1ad",
            },
            "12a0f886-7146-4fe7-8366-460b5c5e5da1": {
                name: "Literature and Poetry",
                _id: "12a0f886-7146-4fe7-8366-460b5c5e5da1",
            },
            "42ca7b92-0a19-41e4-9f37-75fc74e6cbd5": {
                name: "Science Fiction",
                _id: "42ca7b92-0a19-41e4-9f37-75fc74e6cbd5",
            },
            "0491d909-5169-4ee6-abf5-5b0d57015d92": {
                name: "Arts & Photography",
                _id: "0491d909-5169-4ee6-abf5-5b0d57015d92",
            },
            "ee7b8979-9eee-4b05-a59c-c0026d321e0e": {
                name: "Biography & Memoir",
                _id: "ee7b8979-9eee-4b05-a59c-c0026d321e0e",
            },
            "c1036218-4964-418e-9a1e-c7aca28ad160": {
                name: "Science & Technology",
                _id: "c1036218-4964-418e-9a1e-c7aca28ad160",
            },
        },
        books: {
            // Romance books
            "8d1f9a76-8f76-4a71-9d23-6152fda8006c": {
                title: "The Darcy Myth",
                author: "Rachel Feder",
                price: 19.55,
                description: "Covering cultural touchstones ranging from Twilight to Taylor Swift and from Lord Byron to The Bachelor, The Darcy Myth is a book for anyone who loves thinking deeply about literature and culture-whether they love Jane Austen or not. You already know Mr. Darcy-at least you think you do! The brooding, rude, standoffish romantic hero of Pride and Prejudice, Darcy initially insults and ignores the witty heroine, but eventually succumbs to her charms. It's a classic enemies-to-lovers plot, and one that has profoundly influenced our cultural ideas about courtship. But what if this classic isn't just a grand romance, but a horror novel about how scary love and marriage can be for women? In The Darcy Myth, literature scholar Rachel Feder unpacks Austen's Gothic influences and how they've led us to a romantic ideal that's halfway to being a monster story. Why is our culture so obsessed with cruel, indifferent romantic heroes (and sometimes heroines)? How much of that is Darcy's fault? And, now that we know, what do we do about it?",
                publishDate: "November 08, 2023",
                publisher: "Quirk Books",
                pages: 205,
                dimensions: "13x20x2",
                language: "English",
                format: "Paperback",
                quantity: 0,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=12jr4dylqMJgq7kXeL-U4m11vntVWwYxp",
                _categoryId: "12a0f886-7146-4fe7-8366-460b5c5e5da1",
                _id: "8d1f9a76-8f76-4a71-9d23-6152fda8006c"
            },
            "024d5155-2c67-4c10-b3a5-ae5969c466b3": {
                title: "Baumgartner",
                author: "Paul Auster",
                price: 25.11,
                description: "Paul Auster's brilliant eighteenth novel opens with a scorched pot of water, which Sy Baumgartner -- phenomenologist, noted author, and soon-to-be retired philosophy professor - has just forgotten on the stove.Baumgartner's life had been defined by his deep, abiding love for his wife, Anna, who was killed in a swimming accident nine years earlier. Now 71, Baumgartner continues to struggle to live in her absence as the novel sinuously unfolds into spirals of memory and reminiscence, delineated in episodes spanning from 1968, when Sy and Anna meet as broke students working and writing in New York, through their passionate relationship over the next forty years, and back to Baumgartner's youth in Newark and his Polish-born father's life as a dress-shop owner and failed revolutionary.",
                publishDate: "November 07, 2023",
                publisher: "Atlantic Monthly Press",
                pages: 208,
                dimensions: "4x24x3",
                language: "English",
                format: "Hardcover",
                quantity: 3,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1zzQNptXchrJCHjZHR37IfGQaZszwhz4G",
                _categoryId: "d9e9296e-c2ef-48df-b5b6-3df05e99ace0",
                _id: "024d5155-2c67-4c10-b3a5-ae5969c466b3"
            },
            "7056d2f6-9fb6-4e8a-8ecd-6f41aab4f0a7": {
                title: "Pride and Prejudice (Revised)",
                author: "Jane Austen",
                price: 41.85,
                description: "With its 'light and bright and sparkling' dialogue, its romantic denouement and its lively heroine, Pride and Prejudice is Jane Austen's most perennially popular novel. The love story of Elizabeth Bennet and Fitzwilliam Darcy, who misjudge, then challenge and change each other, is also a novel about the search for happiness and self- knowledge in a world of strict social rules, where a woman must marry well to survive.",
                publishDate: "December 31, 2002",
                publisher: "Penguin Group",
                pages: 488,
                dimensions: "14x20x3",
                language: "English",
                format: "Hardcover",
                quantity: 5,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1oEYt9dVQ8hdVlD2mQmh6tdM9WP_GGMcu",
                _categoryId: "d9e9296e-c2ef-48df-b5b6-3df05e99ace0",
                _id: "7056d2f6-9fb6-4e8a-8ecd-6f41aab4f0a7"
            },
            "113ac548-14d5-4b84-9abd-1af36b4978db": {
                title: "Romeo and Juliet",
                author: "William Shakespeare",
                price: 14.87,
                description: "In Romeo and Juliet, Shakespeare creates a violent world, in which two young people fall in love. It is not simply that their families disapprove; the Montagues and the Capulets are engaged in a blood feud. In this death-filled setting, the movement from love at first sight to the lovers' final union in death seems almost inevitable. And yet, this play set in an extraordinary world has become the quintessential story of young love. In part because of its exquisite language, it is easy to respond as if it were about all young lovers. The authoritative edition of Romeo and Juliet from The Folger Shakespeare Library, the trusted and widely used Shakespeare series for students and general readers, includes: \n-Freshly edited text based on the best early printed version of the play \n-Newly revised explanatory notes conveniently placed on pages facing the text of the play \n-Scene-by-scene plot summaries \n-A key to the play's famous lines and phrases \n-An introduction to reading Shakespeare's language \n-An essay by a leading Shakespeare scholar providing a modern perspective on the play \n-Fresh images from the Folger Shakespeare Library's vast holdings of rare books \n-An up-to-date annotated guide to further reading",
                publishDate: "January 01, 2004",
                publisher: "Simon & Schuster",
                pages: 336,
                dimensions: "11x17x3",
                language: "English",
                format: "Hardcover",
                quantity: 10,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1PjioAn9cO2HT-0ZDyDgnebmiBaN1UUYQ",
                _categoryId: "d9e9296e-c2ef-48df-b5b6-3df05e99ace0",
                _id: "113ac548-14d5-4b84-9abd-1af36b4978db"
            },
            "8aca35e0-e55c-4d8c-87a0-6ea6dcd0cac2": {
                title: "Terms and Conditions",
                author: "Auren Asher",
                price: 16.73,
                description: "'m destined to become the next CEO of my family's media empire. The only problem? My grandfather's inheritance clause. Fulfilling his dying wish of getting married and having an heir seemed impossible until my assistant volunteers for the job. Our marriage was supposed to be the perfect solution to my biggest problem.  But the more we act in love for the public, the more unsure I feel about our contract.  Caring about Iris was never part of the deal. Especially not when breaking her heart is inevitable.",
                publishDate: "February 24, 2022",
                publisher: "Bloom Books",
                pages: 480,
                dimensions: "13x20x3",
                language: "English",
                format: "Paperback",
                quantity: 3,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=13I9rvu6TwSbspx_CWBT3RkQLir0o-GhC",
                _categoryId: "d9e9296e-c2ef-48df-b5b6-3df05e99ace0",
                _id: "8aca35e0-e55c-4d8c-87a0-6ea6dcd0cac2"
            },
            "70e68a6b-78be-42e4-9f49-f465d75ed7d4": {
                title: "Jane Eyre",
                author: "Charlotte Brontë",
                price: 13.94,
                description: "When Jane Eyre was first published in 1847, it became an instant bestseller, so popular that the publisher commissioned a second printing in just three months. The story of a young girl--plain, poor, and alone--who endures abuse, abandonment, and ridicule only to become a loving, compassionate young woman of great moral character remains Charlotte Brontë's greatest achievement. Now available as part of the Word Cloud Classics series, Jane Eyre is a must-have addition to the libraries of all classic literature lovers.",
                publishDate: "September 01, 2012",
                publisher: "Canterbury Classics",
                pages: 464,
                dimensions: "14x20x3.5",
                language: "English",
                format: "Imitation leather",
                quantity: 15,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=17Sq-qQiK-lPE6C6BibsDbRbeOrXmaQc0",
                _categoryId: "d9e9296e-c2ef-48df-b5b6-3df05e99ace0",
                _id: "70e68a6b-78be-42e4-9f49-f465d75ed7d4"
            },
            // Horror books
            "842c31bc-8dc1-4327-b65b-af5b881bf25e": {
                title: "Silver Nitrate",
                author: "Silvia Moreno-Garcia",
                price: 26.04,
                description: "Montserrat has always been overlooked. She's a talented sound editor, but she's left out of the boys' club running the film industry in '90s Mexico City. And she's all but invisible to her best friend, Tristán, a charming if faded soap opera star, though she's been in love with him since childhood. Then Tristán discovers his new neighbor is the cult horror director Abel Urueta, and the legendary auteur claims he can change their lives--even if his tale of a Nazi occultist imbuing magic into highly volatile silver nitrate stock sounds like sheer fantasy. The magic film was never finished, which is why, Urueta swears, his career vanished overnight. He is cursed. Now the director wants Montserrat and Tristán to help him shoot the missing scene and lift the curse . . . but Montserrat soon notices a dark presence following her, and Tristán begins seeing the ghost of his ex-girlfriend. As they work together to unravel the mystery of the film and the obscure occultist who once roamed their city, Montserrat and Tristán may find that sorcerers and magic are not only the stuff of movies.",
                publishDate: "July 18, 2023",
                publisher: "Del Rey Books",
                pages: 336,
                dimensions: "16x23x3",
                language: "English",
                format: "Hardcover",
                quantity: 6,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1ZlzFbYoyjNR8FscsuD2ifqeVe4sAnYcQ",
                _categoryId: "e5f56f1e-5631-48a1-8fc5-9f374424306f",
                _id: "842c31bc-8dc1-4327-b65b-af5b881bf25e"
            },
            "8b0ee033-a244-4397-83d4-2faaf481b028": {
                title: "The Haunting of Hill House",
                author: "Shirley Jackson",
                price: 15.81,
                description: "First published in 1959, Shirley Jackson's The Haunting of Hill House has been hailed as a perfect work of unnerving terror. It is the story of four seekers who arrive at a notoriously unfriendly pile called Hill House: Dr. Montague, an occult scholar looking for solid evidence of a \"haunting\"; Theodora, his lighthearted assistant; Eleanor, a friendless, fragile young woman well acquainted with poltergeists; and Luke, the future heir of Hill House. At first, their stay seems destined to be merely a spooky encounter with inexplicable phenomena. But Hill House is gathering its powers--and soon it will choose one of them to make its own.",
                publishDate: "December 01, 2006",
                publisher: "Penguin Group",
                pages: 208,
                dimensions: "12x16x2",
                language: "English",
                format: "Paperback",
                quantity: 15,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1QAG9OHMjnGClqoEK3T9eQfLHCpKCQddQ",
                _categoryId: "e5f56f1e-5631-48a1-8fc5-9f374424306f",
                _id: "8b0ee033-a244-4397-83d4-2faaf481b028"
            },
            "dfb6a4ac-10e6-4ccf-8c40-7c60e6792b5a": {
                title: "Carmilla",
                author: "Joseph Sheridan Lefanu",
                price: 15.81,
                description: "Isolated in a remote mansion in a central European forest, Laura longs for companionship - until a carriage accident brings another young woman into her life: the secretive and sometimes erratic Carmilla. As Carmilla's actions become more puzzling and volatile, Laura develops bizarre symptoms, and as her health goes into decline, Laura and her father discover something monstrous. Joseph Sheridan Le Fanu's compelling tale of a young woman's seduction by a female vampire was a source of influence for Bram Stoker's Dracula, which it predates by over a quarter century. Carmilla was originally serialized from 1871 to 1872 and went on to inspire adaptations in film, opera, and beyond, including the cult classic web series by the same name.",
                publishDate: "November 26, 2019",
                publisher: "Lanternfish Press",
                pages: 144,
                dimensions: "12x16x2",
                language: "English",
                format: "Paperback",
                quantity: 12,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1BABLMbqONgm_gSlxoRm7Cl753ZAancRX",
                _categoryId: "e5f56f1e-5631-48a1-8fc5-9f374424306f",
                _id: "dfb6a4ac-10e6-4ccf-8c40-7c60e6792b5a"
            },
            "088b34d7-f1bc-4f57-9bea-1fea2e1a5ef2": {
                title: "The Fisherman",
                author: "John Langan",
                price: 19.99,
                description: "In upstate New York, in the woods around Woodstock, Dutchman's Creek flows out of the Ashokan Reservoir. Steep-banked, fast-moving, it offers the promise of fine fishing, and of something more, a possibility too fantastic to be true. When Abe and Dan, two widowers who have found solace in each other's company and a shared passion for fishing, hear rumors of the Creek, and what might be found there, the remedy to both their losses, they dismiss it as just another fish story. Soon, though, the men find themselves drawn into a tale as deep and old as the Reservoir. It's a tale of dark pacts, of long-buried secrets, and of a mysterious figure known as Der Fisher: the Fisherman. It will bring Abe and Dan face to face with all that they have lost, and with the price they must pay to regain it.",
                publishDate: "June 30, 2016",
                publisher: "Word Horde",
                pages: 282,
                dimensions: "17x3.5x22",
                language: "English",
                format: "Paperback",
                quantity: 3,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1UwJFsHmcHqG-SxB77qVw-wqeKyKrW3j2",
                _id: "088b34d7-f1bc-4f57-9bea-1fea2e1a5ef2"
            },
            "69bd8ce7-22d6-433c-b3fd-5211082958d4": {
                title: "It",
                author: "Stephen King ",
                price: 20.45,
                description: "Welcome to Derry, Maine. It's a small city, a place as hauntingly familiar as your own hometown. Only in Derry the haunting is real. They were seven teenagers when they first stumbled upon the horror. Now they are grown-up men and women who have gone out into the big world to gain success and happiness. But the promise they made twenty-eight years ago calls them reunite in the same place where, as teenagers, they battled an evil creature that preyed on the city's children. Now, children are being murdered again and their repressed memories of that terrifying summer return as they prepare to once again battle the monster lurking in Derry's sewers.",
                publishDate: "January 05, 2016",
                publisher: "Scribner Book Company",
                pages: 1168,
                dimensions: "16.5x22x6",
                language: "English",
                format: "Paperback",
                quantity: 3,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1Q6_D1tXRQI52BFrO38eQsOINBQBAZqEJ",
                _categoryId: "e5f56f1e-5631-48a1-8fc5-9f374424306f",
                _id: "69bd8ce7-22d6-433c-b3fd-5211082958d4"
            },
            "c9151a95-99fc-4dd7-b12c-76bf6c8c73f5": {
                title: "The Metamorphosis",
                author: "Franz Kafka",
                price: 214.29,
                description: "\"The Metamorphosis\" (original German title: \"Die Verwandlung\") is a short novel by Franz Kafka, first published in 1915. It is often cited as one of the seminal works of fiction of the 20th century and is widely studied in colleges and universities across the western world. The story begins with a traveling salesman, Gregor Samsa, waking to find himself transformed into an insect.",
                publishDate: "January 01, 1915",
                publisher: "12th Media Services",
                pages: 44,
                dimensions: "16.5x20x3",
                language: "English",
                format: "Hardcover",
                quantity: 3,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1l_wq5ct1tdb6iOsuD_SWJonnGPhpOpOD",
                _categoryId: "e5f56f1e-5631-48a1-8fc5-9f374424306f",
                _id: "c9151a95-99fc-4dd7-b12c-76bf6c8c73f5"
            },
            // Poetry books
            "e0fb574b-efc2-4804-b439-9f45bb86155f": {
                title: "The Iliad",
                author: "Homer",
                price: 37.15,
                description: "When Emily Wilson's translation of The Odyssey appeared in 2017--revealing the ancient poem in a contemporary idiom that was \"fresh, unpretentious and lean\" (Madeline Miller, Washington Post)--critics lauded it as \"a revelation\" (Susan Chira, New York Times) and \"a cultural landmark\" (Charlotte Higgins, Guardian) that would forever change how Homer is read in English. Now Wilson has returned with an equally revelatory translation of Homer's other great epic--the most revered war poem of all time. The Iliad roars with the clamor of arms, the bellowing boasts of victors, the fury and grief of loss, and the anguished cries of dying men. It sings, too, of the sublime magnitude of the world--the fierce beauty of nature and the gods' grand schemes beyond the ken of mortals. In Wilson's hands, this thrilling, magical, and often horrifying tale now gallops at a pace befitting its legendary battle scenes, in crisp but resonant language that evokes the poem's deep pathos and reveals palpably real, even \"complicated,\" characters--both human and divine.",
                publishDate: "September 26, 2023",
                publisher: "W. W. Norton & Company",
                pages: 848,
                dimensions: "16.4x24x3.8",
                language: "English",
                format: "Hardcover",
                quantity: 2,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1KlPUK72T5Ey6TUx47rs051cKgD0jRlQ0",
                _categoryId: "12a0f886-7146-4fe7-8366-460b5c5e5da1",
                _id: "e0fb574b-efc2-4804-b439-9f45bb86155f"
            },
            "7217df16-2c14-4141-8baf-3df5f3f475b2": {
                title: "Women Holding Things",
                author: "Maira Kalman",
                price: 30.23,
                description: "Women Holding Things includes the bright, bold images featured in the booklet as well as an additional sixty-seven new paintings highlighted by thoughtful and intimate anecdotes, recollections, and ruminations. Most are portraits of women, both ordinary and famous, including Virginia Woolf, Sally Hemings, Hortense Cezanne, Gertrude Stein, as well as Kalman's family members and other real-life people. These women hold a range of objects, from the mundane--balloons, a cup, a whisk, a chicken, a hat--to the abstract--dreams and disappointments, sorrow and regret, joy and love.",
                publishDate: "October 18, 2022",
                publisher: "Harper",
                pages: 176,
                dimensions: "14x20x2.5",
                language: "English",
                format: "Hardcover",
                quantity: 6,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1Y5Zra43NMVe-OaIfpcEPdq3qXD8pQhcN",
                _categoryId: "12a0f886-7146-4fe7-8366-460b5c5e5da1",
                _id: "7217df16-2c14-4141-8baf-3df5f3f475b2"
            },
            // Science Fiction books
            "85611f43-9987-4c3e-b9b8-9ebcbef8b59b": {
                title: "Prophet Song",
                author: "Paul Lynch",
                price: 24.18,
                description: "On a dark, wet evening in Dublin, scientist and mother-of-four Eilish Stack answers her front door to find two officers from Ireland's newly formed secret police on her step. They have arrived to interrogate her husband, a trade unionist. Ireland is falling apart, caught in the grip of a government turning towards tyranny. As the life she knows and the ones she loves disappear before her eyes, Eilish must contend with the dystopian logic of her new, unraveling country. How far will she go to save her family? And what-or who--is she willing to leave behind?",
                publishDate: "December 05, 2023",
                publisher: "Atlantic Monthly Press",
                pages: 320,
                dimensions: "12.5x2x3",
                language: "English",
                format: "Hardcover",
                quantity: 2,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1iNqxer196eKUXmnUZFxzUfy4BAHMuJns",
                _categoryId: "42ca7b92-0a19-41e4-9f37-75fc74e6cbd5",
                _id: "85611f43-9987-4c3e-b9b8-9ebcbef8b59b"
            },
            "0a9aa176-57ee-47b8-9b1d-888ab95fe7b7": {
                title: "Jurassic Park",
                author: "Michael Crichton",
                price: 9.29,
                description: "\"[Michael] Crichton's dinosaurs are genuinely frightening.\"--Chicago Sun-Times An astonishing technique for recovering and cloning dinosaur DNA has been discovered. Now humankind's most thrilling fantasies have come true. Creatures extinct for eons roam Jurassic Park with their awesome presence and profound mystery, and all the world can visit them--for a price. Until something goes wrong. . . .",
                publishDate: "September 25, 2012",
                publisher: "Ballantine Books",
                pages: 464,
                dimensions: "9x15x2.5",
                language: "English",
                format: "Mass Market Paperbound",
                quantity: 9,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1iX9I1yJPAnYQ-4S1gdr2kqm1o7GTT_OZ",
                _categoryId: "42ca7b92-0a19-41e4-9f37-75fc74e6cbd5",
                _id: "0a9aa176-57ee-47b8-9b1d-888ab95fe7b7"
            },
            // Arts & Photography books
            "2d54f0f0-d38d-407a-93a2-ba5b5873d422": {
                title: "Eyeliner: A Cultural History",
                author: "Zahra Hankir",
                price: 24.18,
                description: "From the distant past to the present, with fingers and felt-tipped pens, metallic powders and gel pots, humans have been drawn to lining their eyes. The aesthetic trademark of figures ranging from Nefertiti to Amy Winehouse, eyeliner is one of our most enduring cosmetic tools; ancient royals and Gen Z beauty influencers alike would attest to its uniquely transformative power. It is undeniably fun--yet it is also far from frivolous. Seen through Zahra Hankir's (kohl-lined) eyes, this ubiquitous but seldom-examined product becomes a portal to history, proof both of the stunning variety among cultures across time and space and of our shared humanity. Through intimate reporting and conversations--with nomads in Chad, geishas in Japan, dancers in India, drag queens in New York, and more--Eyeliner embraces the rich history and significance of its namesake, especially among communities of color. What emerges is an unexpectedly moving portrait of a tool that, in various corners of the globe, can signal religious devotion, attract potential partners, ward off evil forces, shield eyes from the sun, transform faces into fantasies, and communicate volumes without saying a word.",
                publishDate: "November 14, 2023",
                publisher: "Penguin Books",
                pages: 368,
                dimensions: "12x18x3",
                language: "English",
                format: "Hardcover",
                quantity: 5,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1xBeFBAhOxAiHY2EewFbFYDIHxpPCHbN7",
                _categoryId: "0491d909-5169-4ee6-abf5-5b0d57015d92",
                _id: "2d54f0f0-d38d-407a-93a2-ba5b5873d422"
            },
            "45b0a8c7-d03a-4f32-ae7d-b8dfcd11d922": {
                title: "Colors of Film: The Story of Cinema in 50 Palettes",
                author: "Charles Bramesco",
                price: 26.00,
                description: "The use of color is an essential part of film. It has the power to evoke powerful emotions, provide subtle psychological symbolism and act as a narrative device. Wes Anderson's pastels and muted tones are aesthetically pleasing, but his careful use of color also acts as a shorthand for interpreting emotion. Moonlight(2the use of colo016, dir. Barry Jenkins) cinematographer (James Laxton) and colorist (Alex Bickel) spent 100 hours fine-tuning the saturation and hues of the footage so that r evolved in line with the growth of the protagonist through the film. And let's not forget Schindler's List (1993, dir. Steven Spielberg), in which a bold flash of red against an otherwise black-and-white film is used as a powerful symbol of life, survival and death. In Colors of Film, film critic Charles Bramesco introduces an element of cinema that is often overlooked, yet has been used in extraordinary ways. Using infographic color palettes, and stills from the movies, this is a lively and fresh approach to film for cinema-goers and color lovers alike.",
                publishDate: "March 14, 2023",
                publisher: "Frances Lincoln",
                pages: 208,
                dimensions: "22.6x30x3.3",
                language: "English",
                format: "Hardcover",
                quantity: 5,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1jd5fVZ0Pn5gFwJnhbYsNGfIAsj44dBZc",
                _categoryId: "0491d909-5169-4ee6-abf5-5b0d57015d92",
                _id: "45b0a8c7-d03a-4f32-ae7d-b8dfcd11d922"
            },
            "669f2160-521f-4e80-8398-cdf32acd868a": {
                title: "Architecture: A Very Short Introduction",
                author: "Andrew Ballantyne",
                price: 64.95,
                description: "This highly original and sophisticated look at architecture helps us to understand the cultural significance of the buildings that surround us. It avoids the traditional style-spotting approach and instead gives us an idea of what it is about buildings that moves us, and what it is that makes them important artistically and culturally. The book begins by looking at how architecture acquires meaning through tradition, and concludes with the exoticism of the recent avant-garde period. Illustrations of particular buildings help to anchor the general points with specific examples, from ancient Egypt to the present day.",
                publishDate: "December 19, 2002",
                publisher: "Oxford University Press, USA",
                pages: 152,
                dimensions: "11x18x1",
                language: "English",
                format: "Paperback",
                quantity: 10,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1MVmZyFbbU1m3vKTvM2FUB0AI0mRbs6AK",
                _categoryId: "0491d909-5169-4ee6-abf5-5b0d57015d92",
                _id: "669f2160-521f-4e80-8398-cdf32acd868a"
            },
            // Biography & Memoir books
            "775a119a-3cce-48c5-8e26-19b2639956e8": {
                title: "My Name Is Barbra",
                author: "Barbra Streisand",
                price: 43.71,
                description: "Barbra Streisand is by any account a living legend, a woman who in a career spanning six decades has excelled in every area of entertainment. She is among the handful of EGOT winners (Emmy, Grammy, Oscar, and Tony) and has one of the greatest and most recognizable voices in the history of popular music. She has been nominated for a Grammy 46 times, and with Yentl she became the first woman to write, produce, direct, and star in a major motion picture. In My Name Is Barbra, she tells her own story about her life and extraordinary career, from growing up in Brooklyn to her first star-making appearances in New York nightclubs to her breakout performance in Funny Girl on stage and winning the Oscar for that performance on film. Then came a long string of successes in every medium in the years that followed. The book is, like Barbra herself, frank, funny, opinionated, and charming. She recounts her early struggles to become an actress, eventually turning to singing to earn a living; the recording of some of her acclaimed albums; the years of effort involved in making Yentl; her direction of The Prince of Tides; her friendships with figures ranging from Marlon Brando to Madeleine Albright; her political advocacy; and the fulfillment she's found in her marriage to James Brolin. No entertainer's memoir has been more anticipated than Barbra Streisand's, and this engrossing and delightful book will be eagerly welcomed by her millions of fans.",
                publishDate: "November 07, 2023",
                publisher: "Viking",
                pages: 992,
                dimensions: "1.5x25x6",
                language: "English",
                format: "Hardcover",
                quantity: 7,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1iNBjXgRHuZFccS4ev22S3NJSbCTgwf8l",
                _categoryId: "ee7b8979-9eee-4b05-a59c-c0026d321e0e",
                _id: "775a119a-3cce-48c5-8e26-19b2639956e8"
            },
            "6eb0a28d-7ace-403c-8e26-5c52b71afe5b": {
                title: "Napoleon: A Life",
                author: "Andrew Roberts",
                price: 23.25,
                description: "Austerlitz, Borodino, Waterloo: his battles are among the greatest in history, but Napoleon Bonaparte was far more than a military genius and astute leader of men. Like George Washington and his own hero Julius Caesar, he was one of the greatest soldier-statesmen of all times.  Andrew Roberts's Napoleon is the first one-volume biography to take advantage of the recent publication of Napoleon's thirty-three thousand letters, which radically transform our understanding of his character and motivation. At last we see him as he was: protean multitasker, decisive, surprisingly willing to forgive his enemies and his errant wife Josephine. Like Churchill, he understood the strategic importance of telling his own story, and his memoirs, dictated from exile on St. Helena, became the single bestselling book of the nineteenth century.",
                publishDate: "October 20, 2015",
                publisher: "Penguin Books",
                pages: 976,
                dimensions: "15.5x18x5",
                language: "English",
                format: "Paperback",
                quantity: 12,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1qNlKyVbjTe3TmSzbiUewYyrhgS_BzSl4",
                _categoryId: "ee7b8979-9eee-4b05-a59c-c0026d321e0e",
                _id: "6eb0a28d-7ace-403c-8e26-5c52b71afe5b"
            },
            // Science & Technology Books
            "84caebad-46a3-4d13-8d8a-d197c4e4fce4": {
                title: "White Holes",
                author: "Carlo Rovelli",
                price: 26.00,
                description: "Let us journey, with beloved physicist Carlo Rovelli, into the heart of a black hole. We slip beyond its horizon and tumble down this crack in the universe. As we plunge, we see geometry fold. Time and space pull and stretch. And finally, at the black hole's core, space and time dissolve, and a white hole is born. Rovelli has dedicated his career to uniting the time-warping ideas of general relativity and the perplexing uncertainties of quantum mechanics. In White Holes, he reveals the mind of a scientist at work. He traces the ongoing adventure of his own cutting-edge research, investigating whether all black holes could eventually turn into white holes, equally compact objects in which the arrow of time is reversed. Rovelli writes just as compellingly about the work of a scientist as he does the marvels of the universe. He shares the fear, uncertainty, and frequent disappointment of exploring hypotheses and unknown worlds, and the delight of chasing new ideas to unexpected conclusions. Guiding us beyond the horizon, he invites us to experience the fever and the disquiet of science--and the strange and startling life of a white hole.",
                publishDate: "October 31, 2023",
                publisher: "Riverhead Books",
                pages: 176,
                dimensions: "15.5x18x2.3",
                language: "English",
                format: "Hardcover",
                quantity: 15,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1R5vxbx7Onw8kq5wX96kTh_pYIiURahlL",
                _categoryId: "c1036218-4964-418e-9a1e-c7aca28ad160",
                _id: "84caebad-46a3-4d13-8d8a-d197c4e4fce4"
            },
            "947bc628-797d-4f52-ac9b-8e0ff7d57dc6": {
                title: "To Infinity and Beyond: A Journey of Cosmic Discovery",
                author: "Neil Degrasse Tyson, Lindsey Nyx Walker",
                price: 27.90,
                description: "No one can make the mysteries of the universe more comprehensible and fun than Neil deGrasse Tyson. Drawing on mythology, history, and literature--alongside his trademark wit and charm--Tyson and StarTalk senior producer Lindsey Nyx Walker bring planetary science down to Earth and principles of astrophysics within reach. In this entertaining book, illustrated with vivid photographs and art, readers travel through space and time, starting with the Big Bang and voyaging to the far reaches of the universe and beyond. Along the way, science greets pop culture as Tyson explains the triumphs--and bloopers--in Hollywood's blockbusters: all part of an entertaining ride through the cosmos.",
                publishDate: "September 12, 2023",
                publisher: "National Geographic Society",
                pages: 320,
                dimensions: "13x20x3.5",
                language: "English",
                format: "Hardcover",
                quantity: 7,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1YxBfOXzHcnsn54MrnAUxoUNMqCi7DfSN",
                _categoryId: "c1036218-4964-418e-9a1e-c7aca28ad160",
                _id: "947bc628-797d-4f52-ac9b-8e0ff7d57dc6"
            },
            "2075ac4e-5995-4d0f-8306-8195e9f00f05": {
                title: "On the Origin of Time: Stephen Hawking's Final Theory",
                author: "Thomas Hertog",
                price: 26.96,
                description: "Perhaps the biggest question Stephen Hawking tried to answer in his extraordinary life was how the universe could have created conditions so perfectly hospitable to life. In order to solve this mystery, Hawking studied the big bang origin of the universe, but his early work ran into a crisis when the math predicted many big bangs producing a multiverse--countless different universes, most of which would be far too bizarre to ​harbor life.\nHoled up in the theoretical physics department at Cambridge, Stephen Hawking and his friend and collaborator Thomas Hertog worked on this problem for twenty years, developing a new theory of the cosmos that could account for the emergence of life. Peering into the extreme quantum physics of cosmic holograms and venturing far back in time to our deepest roots, they were startled to find a deeper level of evolution in which the physical laws themselves transform and simplify until particles, forces, and even time itself fades away. This discovery led them to a revolutionary idea: The laws of physics are not set in stone but are born and co-evolve as the universe they govern takes shape. As Hawking's final days drew near, the two collaborators published their theory, which proposed a radical new Darwinian perspective on the origins of our universe.",
                publishDate: "April 11, 2023",
                publisher: "Bantam",
                pages: 352,
                dimensions: "16x25x3",
                language: "English",
                format: "Hardcover",
                quantity: 14,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1vT2gN6T1GunsYtSlf8gpEKa9EqBQ1Ua1",
                _categoryId: "c1036218-4964-418e-9a1e-c7aca28ad160",
                _id: "2075ac4e-5995-4d0f-8306-8195e9f00f05"
            },
            "df3a6362-7411-4c81-9dde-0e1964ce74cf": {
                title: "The Maid",
                author: "Nita Prose",
                price: 16.74,
                description: "Molly Gray is not like everyone else. She struggles with social skills and misreads the intentions of others. Her gran used to interpret the world for her, codifying it into simple rules that Molly could live by. Since Gran died a few months ago, twenty-five-year-old Molly has been navigating life's complexities all by herself. No matter--she throws herself with gusto into her work as a hotel maid. Her unique character, along with her obsessive love of cleaning and proper etiquette, make her an ideal fit for the job. She delights in donning her crisp uniform each morning, stocking her cart with miniature soaps and bottles, and returning guest rooms at the Regency Grand Hotel to a state of perfection. But Molly's orderly life is upended the day she enters the suite of the infamous and wealthy Charles Black, only to find it in a state of disarray and Mr. Black himself dead in his bed. Before she knows what's happening, Molly's unusual demeanor has the police targeting her as their lead suspect. She quickly finds herself caught in a web of deception, one she has no idea how to untangle. Fortunately for Molly, friends she never knew she had unite with her in a search for clues to what really happened to Mr. Black--but will they be able to find the real killer before it's too late?",
                publishDate: "January 03, 2023",
                publisher: "Ballantine Books",
                pages: 336,
                dimensions: "13x21x2",
                language: "English",
                format: "Paperback",
                quantity: 14,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1MO589wt09ht8aCiRBJQpkc4pADSBKaZ0",
                _categoryId: "8d04c99d-a900-4440-8d67-64ead7e2298f",
                _id: "df3a6362-7411-4c81-9dde-0e1964ce74cf"
            },
            "ed0abca9-bcd5-47a7-83bc-96921d542d82": {
                title: "Most Delicious Poison: The Story of Nature's Toxins--From Spices to Vices",
                author: "Noah Whiteman",
                price: 27.90,
                description: "A deadly secret lurks within our spice racks, medicine cabinets, backyard gardens, and private stashes. Scratch beneath the surface of a coffee bean, a red pepper flake, a poppy seed, a mold spore, a foxglove leaf, a magic-mushroom cap, a marijuana bud, or an apple seed, and we find a bevy of strange chemicals. We use these to greet our days (caffeine), titillate our tongues (capsaicin), recover from surgery (opioids), cure infections (penicillin), mend our hearts (digoxin), bend our minds (psilocybin), calm our nerves (CBD), and even kill our enemies (cyanide). But why do plants and fungi produce such chemicals? And how did we come to use and abuse some of them?",
                publishDate: "October 24, 2023",
                publisher: "Little Brown Spark",
                pages: 304,
                dimensions: "16x21x3",
                language: "English",
                format: "Hardcover",
                quantity: 7,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1xZhaWuVbyQejkMBmREVIhbW1UAnD-uz2",
                _categoryId: "c1036218-4964-418e-9a1e-c7aca28ad160",
                _id: "ed0abca9-bcd5-47a7-83bc-96921d542d82"
            },
            "0047313e-79fc-4039-944e-f5d0e9e00e62": {
                title: "My Murder",
                author: "Katie Williams",
                price: 25.11,
                description: "What if the murder you had to solve was your own? Lou is a happily married mother of an adorable toddler. She's also the victim of a local serial killer. Recently brought back to life and returned to her grieving family by a government project, she is grateful for this second chance. But as the new Lou re-adapts to her old routines, and as she bonds with other female victims, she realizes that disturbing questions remain about what exactly preceded her death and how much she can really trust those around her. Now it's not enough to care for her child, love her husband, and work the job she's always enjoyed--she must also figure out the circumstances of her death. Darkly comic, tautly paced, and full of surprises, My Murder is a devour-in-one-sitting, clever twist on the classic thriller.",
                publishDate: "June 06, 2023",
                publisher: "Riverhead Books",
                pages: 304,
                dimensions: "15.5x19x3",
                language: "English",
                format: "Hardcover",
                quantity: 11,
                rating: 0,
                imageUrl: "https://drive.google.com/uc?export=view&id=1SstJiVJaG9lkQQeSoFE_Ak1loRHb7Eeh",
                isBestseller: false,
                _categoryId: "8d04c99d-a900-4440-8d67-64ead7e2298f",
                _id: "0047313e-79fc-4039-944e-f5d0e9e00e62"
            },
            "b452b58a-c6a0-4b85-b52f-2d654a2ceb56": {
                title: "The Secret History",
                author: "Donna Tartt",
                price: 16.74,
                description: "Under the influence of a charismatic classics professor, a group of clever, eccentric misfits at a New England college discover a way of thought and life a world away from their banal contemporaries. But their search for the transcendent leads them down a dangerous path, beyond human constructs of morality.",
                publishDate: "April 13, 2004",
                publisher: "Vintage",
                pages: 576,
                dimensions: "13x18x2.5",
                language: "English",
                format: "Paperback",
                quantity: 18,
                isBestseller: false,
                rating: 0,
                imageUrl: "https://drive.google.com/uc?export=view&id=1GbounDSFkB2oJ6vLZI5x01Xj1pzEiqTC",
                _categoryId: "8d04c99d-a900-4440-8d67-64ead7e2298f",
                _id: "b452b58a-c6a0-4b85-b52f-2d654a2ceb56"
            },
            "4fa3da51-b60e-4241-a414-0edd3fd4ef4c": {
                title: "Bright Young Women",
                author: "Jessica Knoll",
                price: 26.03,
                description: "Masterfully blending elements of psychological suspense and true crime, Jessica Knoll--author of the bestselling novel Luckiest Girl Alive and the writer behind the Netflix adaption starring Mila Kunis--delivers a new and exhilarating thriller in Bright Young Women. The book opens on a Saturday night in 1978, hours before a soon-to-be-infamous murderer descends upon a Florida sorority house with deadly results. The lives of those who survive, including sorority president and key witness, Pamela Schumacher, are forever changed. Across the country, Tina Cannon is convinced her missing friend was targeted by the man papers refer to as the All-American Sex Killer--and that he's struck again. Determined to find justice, the two join forces as their search for answers leads to a final, shocking confrontation. Blisteringly paced, Bright Young Women is \Jessica Knoll at her best--an unflinching and evocative novel about the tabloid fascination with evil and the dynamic and brilliant women who have the real stories to tell\" (Laura Dave, New York Times bestselling author of The Last Thing He Told Me); and \"a compelling, almost hypnotic read and I loved it with a passion\" (Lisa Jewell, New York Times bestselling author of None of This Is True).",
                publishDate: "September 19, 2023",
                publisher: "S&s/ Marysue Rucci Books",
                pages: 384,
                dimensions: "15x25x2.5",
                language: "English",
                format: "Hardcover",
                quantity: 10,
                rating: 0,
                isBestseller: true,
                imageUrl: "https://drive.google.com/uc?export=view&id=1Da0f5jPAnzzI-dkS1AFZUy1KVN6FafFn",
                _categoryId: "8d04c99d-a900-4440-8d67-64ead7e2298f",
                _id: "4fa3da51-b60e-4241-a414-0edd3fd4ef4c"
            },
            "a783d826-2e7b-483d-af92-e72bb2683541": {
                title: "Tombs: Junji Ito Story Collection",
                author: "Junji Ito",
                price: 23.25,
                description: "Three-time Eisner Award winner Junji Ito invites you to the horrific Tomb Town and beyond. Countless tombstones stand in rows throughout a small community, forming a bizarre tableau. What fate awaits a brother and sister after a traffic accident in this town of the dead? In another tale, a girl falls silent, her tongue transformed into a slug. Can a friend save her? Then, when a young man moves to a new town, he finds the house next door has only a single window. What does his grotesque neighbor want, calling out to him every evening from that lone window? Fresh nightmares brought to you by horror master Junji Ito.",
                publishDate: "March 28, 2023",
                publisher: "Viz Media",
                pages: 344,
                dimensions: "15x21x3",
                language: "English",
                format: "Hardcover",
                quantity: 9,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1Y0ega9yMDW9XI-Nm0EMx8jXapZWETCUr",
                _categoryId: "3ba68fc3-fc14-40c9-8de6-33a936cba1ad",
                _id: "a783d826-2e7b-483d-af92-e72bb2683541"
            },
            "6abb875b-81ec-4220-a3e1-5d528f030360": {
                title: "Venus in the Blind Spot",
                author: "Junji Ito",
                price: 21.38,
                description: "This striking collection presents the most remarkable short works of Junji Ito's career, featuring an adaptation of Rampo Edogawa's classic horror story \"Human Chair\" and fan favorite \"The Enigma of Amigara Fault.\" With a deluxe presentation--including special color pages, and showcasing illustrations from his acclaimed long-form manga No Longer Human--each chilling tale invites readers to revel in a world of terror.",
                publishDate: "August 18, 2020",
                publisher: "Viz Media",
                pages: 272,
                dimensions: "15x22x2.5",
                language: "English",
                format: "Hardcover",
                quantity: 10,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1BMl9I31xam-ZOZMkvw5Ktar6Cc_nCqs5",
                _categoryId: "3ba68fc3-fc14-40c9-8de6-33a936cba1ad",
                _id: "6abb875b-81ec-4220-a3e1-5d528f030360"
            },
            "80cc44dd-5955-4df9-8c45-43eadd6e8b5f": {
                title: "Berserk, Volume 6",
                author: "Kentaro Miura",
                price: 14.99,
                description: "Back in the day, Guts the Black Swordsman was a top slayer for The Band of the Hawk, an elite mercenary unit led by Griffith, whose calm demeanor and callow beauty belied his fighting prowess and steel will. While in a king's employ, the attraction between the king's daughter and Griffith and the growing favor of the king towards the Hawk leader raises the hackles of the king's jealous son, who plots to have Griffith summarily assassinated. But if the plot fails, the king's son will likely have to deal with Guts and his titanic broadsword, and the results of such confrontations are rarely pretty... or easy to clean up.",
                publishDate: "February 01, 2005",
                publisher: "Dark Horse Manga",
                pages: 223,
                dimensions: "13x18.4x1.9",
                language: "English",
                format: "Paperback",
                quantity: 12,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1vVwCT9ddSR2aW9-VVUYrfPTkqDLVGZmZ",
                _categoryId: "3ba68fc3-fc14-40c9-8de6-33a936cba1ad",
                _id: "80cc44dd-5955-4df9-8c45-43eadd6e8b5f"
            },
            "cff21b2f-46c1-4a25-9806-b37eafbdc983": {
                title: "1000 Chairs. Revised and Updated Edition",
                author: "Taschen, Fiell",
                price: 23.25,
                description: "More than any other piece of furniture, the chair has been subjected to the wildest dreams of the designer. The particular curve of a backrest, or the twist of a leg, the angle of a seat or the color of the entire artifact; each element reflects the stylistic consciousness of an era. From Gerrit Rietveld and Alvar Aalto to Verner Panton and Eva Zeisel, from Art Nouveau to International Style, from Pop Art to Postmodernism, the history of the chair is so complex that it requires a comprehensive encyclopedic work to do it full justice. They are all here: Thonet's bentwood chairs and Hoffmann's sitting-machines, Marcel Breuer's Wassily chair and Ron Arad's avant-garde armchairs. Early designers and pioneers of the modern chair are presented alongside the most recent innovations in seating. This dedicated compendium displays each chair as pure form, along with biographical and historical information about the pieces and their designers. An illuminating tome for design aficionados and an essential reference for collectors!",
                publishDate: "September 25, 2017",
                publisher: "Taschen",
                pages: 208,
                dimensions: "15x20x5",
                language: "English",
                format: "Hardcover",
                quantity: 14,
                rating: 0,
                isBestseller: false,
                imageUrl: "https://drive.google.com/uc?export=view&id=1vuRYfEPNi9nLGM9kvRc5pkee7yWYI6Zf",
                _categoryId: "0491d909-5169-4ee6-abf5-5b0d57015d92",
                _id: "cff21b2f-46c1-4a25-9806-b37eafbdc983"
            },
           
            // "": {
            //     title: "",
            //     author: "",
            //     price: ,
            //     description: "",
            //     publishDate: "",
            //     publisher: "",
            //     pages: ,
            //     dimensions: "",
            //     language: "",
            //     format: "",
            //     quantity: ,
            //     rating: ,
            //     isBestseller: false,
            //     imageUrl: "",
            //     _categoryId: "",
            //     _id: ""
            // },
         
        },
        reviews:{}
    };
    var rules$1 = {
    	users: {
    		".create": false,
    		".read": [
    			"Owner"
    		],
    		".update": false,
    		".delete": false
    	},
    	members: {
    		".update": "isOwner(user, get('teams', data.teamId))",
    		".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
    		"*": {
    			teamId: {
    				".update": "newData.teamId = data.teamId"
    			},
    			status: {
    				".create": "newData.status = 'pending'"
    			}
    		}
    	}
    };
    var settings = {
    	identity: identity,
    	protectedData: protectedData,
    	seedData: seedData,
    	rules: rules$1
    };

    const plugins = [
        storage(settings),
        auth(settings),
        util$2(),
        rules(settings)
    ];

    const server = http__default['default'].createServer(requestHandler(plugins, services));

    const port = 3030;
    server.listen(port);
    console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
    console.log(`Admin panel located at http://localhost:${port}/admin`);

    var softuniPracticeServer = {

    };

    return softuniPracticeServer;

})));

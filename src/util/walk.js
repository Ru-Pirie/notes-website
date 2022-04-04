const __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
	// eslint-disable-next-line max-statements-per-line
	function adopt(value) { return value instanceof P ? value : new P(function(resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try { step(generator.next(value)); }
			catch (e) { reject(e); }
		}
		function rejected(value) {
			try { step(generator['throw'](value)); }
			catch (e) { reject(e); }
		}
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};

Object.defineProperty(exports, '__esModule', { value: true });
exports.walk = void 0;

const fs_1 = require('fs');
const path_1 = require('path');
const Logger = require('./logger'); 

const error = new Logger().error;

function walk(directory, filter, options) {
	let _a;
	return __awaiter(this, void 0, void 0, function* () {
		// Verify directory
		if (typeof directory !== 'string') {error('directory must be a valid path');}
		if (directory === '/' || directory === '\\' || directory.toLowerCase() === 'c:/' || directory.toLowerCase() === 'c://' || directory.toLowerCase() === 'c:\\' || directory.toLowerCase() === 'c:\\\\') {
			error('directory must not start at the drive root');
		}
		// Build options
		if (typeof options !== 'object') {
			options = {
				recursive: true,
				stat: false,
			};
		}
		if (typeof options.recursive !== 'boolean') {options.recursive = true;}
		if (typeof options.stat !== 'boolean') {options.stat = false;}
		// Persistant Information
		const indexed = [];
		// const errored = [];
		// Search FileSystem
		const searched = fs_1.readdirSync(directory);
		for (let index = 0; index < searched.length; index++) {
			const file = searched[index];
			if (options.recursive) {
				try {
					const lStat = fs_1.lstatSync(path_1.resolve(directory, './', file));
					if (lStat.isDirectory()) {
						const resp = yield walk(path_1.join(directory, file), filter, options);
						resp.files.forEach((wFile) => {
							indexed.push(wFile);
						});
						// resp.errors.forEach((wError) => {
						// 	errored.push(wError);
						// });
						continue;
					}
				}
				catch (err) {
					error('I have encountered a walk error', err);
					continue;
				}
			}
			const constructed = {
				directory: path_1.resolve(directory, './'),
				folder: (_a = directory.split(path_1.sep).pop()) !== null && _a !== void 0 ? _a : 'N/A',
				name: file,
				extension: file.split('.')[file.split('.').length - 1],
				exact: path_1.resolve(directory, './', file),
			};
			try {
				if (options.stat) {
					constructed.stat = fs_1.statSync(constructed.exact);
				}
			}
			catch (err) {
				error('I have encountered a walk error', err);
				continue;
			}
			if (typeof filter === 'function' && !filter(file, constructed)) {
				continue;
			}
			indexed.push(constructed);
		}
		// Response
		return {
			files: indexed,
		};
	});
}

exports.walk = walk;
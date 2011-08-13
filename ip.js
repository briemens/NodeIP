var shell = require('child_process');
var sys = require('sys');
var nic = '';

if (process.argv.length === 3) {
	nic = process.argv[2];
}

shell.exec('ifconfig ' + nic, function (err, stdout, stderr) {
	var nics = new Nics(stdout.toString());
	nics.nics.forEach(function (nic) {
		if (nic.ip4) {
			console.log(nic.name + ": " + nic.ip4);
		}
	});
	return;
	console.log(sys.inspect(nics));
	console.log(sys.inspect(nics.getActive()));
});

function Nics(text) {
	var self = this;
	
	this.nics = [];
	this.getActive = function () {
		var active = [];
		self.nics.forEach(function (nic) {
			if (nic.status === 'active') {
				active.push(nic);
			}
		});
		return active;
	};
	var nicRegEx = /^(\w*\d)(?:[\:])/gm;
	var nicIndexes = [];
	var match;

	while (match !== null) {
		match = nicRegEx.exec(text);
		if (match !== null) {
			nicIndexes.push({ name: match[1], index: match.index });
		}
	}

	for (var index = index || 0; index < nicIndexes.length; index += 1) {
		var startIndex = nicIndexes[index].index + nicIndexes[index].name.length + 2;
		var endIndex = ((nicIndexes[index + 1] || { index: null }).index || text.length) - 1;
		self.nics.push(new Nic(nicIndexes[index].name, text.substr(startIndex, endIndex - startIndex)));
//		console.log(sys.inspect(new Nic(nicIndexes[index].name, output.substr(startIndex, endIndex - startIndex))));
//		console.log('|' + output.substr(startIndex, endIndex - startIndex) + '|');
	}

//	console.log(sys.inspect(matches));
	//console.log(output, sys.inspect(nicIndexes));
}

function Nic(name, text) {
	var self = this;
	this.name = name;
	this.ip4 = '';
//this.text = text;
	var nicRegEx = /^\t(\w+)(?:[\:]?[ ])/gm;
	var nicIndexes = [];
	var match;

	while (match !== null) {
		match = nicRegEx.exec(text);
		if (match !== null) {
//			console.log(sys.inspect(match));
			nicIndexes.push({ name: match[1], keyIndex: match.index, valueIndex: match.index + match[0].length });
		}
	}
//	console.log(sys.inspect(nicIndexes));

	for (var index = 0; index < nicIndexes.length; index += 1) {
		var startIndex = nicIndexes[index].valueIndex;
		var endIndex = (nicIndexes[index + 1] || { keyIndex: text.length }).keyIndex;
		var value = this[nicIndexes[index].name] = text.substr(startIndex, endIndex - startIndex).replace(/[\n\t]/, '');
		
		if ( nicIndexes[index].name === 'inet') {
			self.ip4 = value.match(/\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}/)[0];
		}
//		console.log(nicIndexes[index].name, text.substr(startIndex, endIndex - startIndex).replace(/[\n\t]/, ''));
	}
}
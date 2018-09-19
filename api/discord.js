function getMention(id, kind) {
	switch(kind || 'user') {
		case 'user':
			return '<@!'+id+'>';
		case 'role':
			return '<@&'+id+'>';
		case 'channel':
			return '<#'+id+'>';
		default:
			throw new TypeError("Unknown mention kind");
	}
}

exports.getMention=getMention

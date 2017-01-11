
function queryString(query) {
	var re           = /([^&=]+)=([^&]+)/g,
		decodedSpace = /\+/g;

	query = query || window.location.href.split('?')[1]

	var result = {},
		m, key, value;

	query = query.replace(decodedSpace, '%20');

	while ((m = re.exec(query))) {
		key   = decodeURIComponent( m[1] );
		value = decodeURIComponent( m[2] );
		result[ key ] = value;
	}

	return result;
}
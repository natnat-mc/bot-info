function ajax(method, url, query, body, headers, json) {
	if(!headers) headers={};
	if(!query) query={};
	if(!body) body=null;
	
	let paramStr=Object.keys(query)
		.map(a => encodeURIComponent(a)+'='+encodeURIComponent(query[a]))
		.join('&');
	if(paramStr) url+='?'+paramStr;
	
	return new Promise((ok, ko) => {
		let xhr=new XMLHttpRequest();
		xhr.open(method, url, true);
		if(typeof body=='object') {
			xhr.setRequestHeader('Content-Type', 'application/json');
			body=JSON.stringify(body);
		}
		for(let h in headers) {
			xhr.setRequestHeader(k, headers[k]);
		}
		xhr.addEventListener('load', () => {
			if(json) {
				ok(JSON.parse(xhr.responseText));
			} else {
				ok(xhr.responseText);
			}
		});
		xhr.addEventListener('error', () => {
			ko();
		});
		xhr.send(body);
	});
}

function nextTick() {
	return new Promise((ok, ko) => setTimeout(ok, 0));
}

let loggedIn=false;
let password;
(async () => {
	let loginInfo=localStorage.getItem('login');
	if(loginInfo) loginInfo=JSON.parse(loginInfo);
	if(loginInfo && loginInfo.loggedIn) {
		let result=await ajax('GET', 'verifypassword', {password: loginInfo.password}, 0, 0, true);
		if(result.ok) {
			loggedIn=true;
			password=loginInfo.password;
		}
	}
	await nextTick();
	if(loggedIn) {
		document.querySelectorAll('.notloggedin').forEach(a => a.style.display='none');
	} else {
		document.querySelectorAll('.loggedin').forEach(a => a.style.display='none');
	}
})();

async function login() {
	const input=document.querySelector('#loginform [type=password]');
	let result=await ajax('GET', 'verifypassword', {password: input.value}, 0, 0, true);
	if(result.ok) {
		localStorage.setItem('login', JSON.stringify({
			loggedIn: true,
			password: input.value
		}));
		location.href='.';
	} else {
		alert("Mot de passe invalide");
	}
	console.log(result.ok);
}

async function logout() {
	localStorage.setItem('login', JSON.stringify({
		loggedIn: false
	}));
	location.href='.';
}

async function update() {
	let orders=await ajax('GET', 'orders', 0, 0, 0, true);
	for(let i=1; i<=100; i++) {
		document.querySelector("#order-"+i).classList.value='waiting';
	}
	for(let k in orders) {
		document.querySelector("#order-"+k).classList.value=orders[k];
	}
}

async function setState(id, state) {
	let res=await ajax('PUT', 'orders/'+id, {password}, {status: state}, 0, true);
	if(res.ok) {
		document.querySelector("#order-"+id).classList.value=state;
		return true;
	} else {
		throw new Error(res.err);
	}
}

let mode;
function setMode(m) {
	mode=m;
	document.querySelectorAll('.mode').forEach(a => a.classList.remove('mode-selected'));
	document.querySelector('.mode-'+m).classList.add('mode-selected');
}

// main code
(async () => {
	// await load
	await nextTick();
	await new Promise(ok => {
		window.onload=ok;
		if(document.readyState=='complete') ok();
	});
	
	// order list page
	if(document.querySelector('#orders')) {
		// setup autoreload
		setInterval(update, 1000*10);
		
		if(loggedIn) {
			// set mode to 'ok' by default
			setMode('ok');
			
			// add click listeners to orders
			for(let i=1; i<=100; i++) {
				let td=document.querySelector('#order-'+i);
				td.addEventListener('click', e => {
					e.preventDefault();
					if(td.classList.contains(mode)) {
						setState(i, 'waiting');
					} else {
						setState(i, mode);
					}
				});
			}
		}
	}
})();

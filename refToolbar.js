/* ------------------------------------------------------------------------ *\
  Copyright: en:User:Mr.Z-man (en), Wikipedysta:Holek (pl), pl:User:Nux
   Licencja: GFDL oraz CC-BY-SA
 
  Original:
	http://en.wikipedia.org/wiki/User:Mr.Z-man/refToolbar.js
	
  Version:
    (see below) = refsTB.version
\* ------------------------------------------------------------------------ */
var tmp_refsTB_VERSION = '1.2.3';

//
// Object Init
//
if (document.cookie.indexOf("js_refsTB_critical=1")==-1 && refsTB!=undefined)
{
	alert('Błąd krytyczny - konflikt nazw!'+
		'\n\n'+
		'Jeden ze skryptów używa już nazwy "refsTB" jako nazwę zmiennej globalnej.');
	document.cookie = "js_refsTB_critical=1; path=/";
	if (document.cookie.indexOf("js_refsTB_critical=1")!=-1)
	{
		alert('Poprzedni komunikat jest wyświetlany tylko raz w ciągu sesji.'+
		'\n\n'+
		'Musisz rozwiązać konflikt nazw lub usunąć jeden ze skryptów w całości.');
	}

}
var refsTB = new Object();
refsTB.version = tmp_refsTB_VERSION;

//
// Attributes
//
refsTB.numforms = 0;	// number of forms
//var wikEdAutoUpdateUrl;

//
// Methods
//

// add a button and a buttons toolbar
refsTB.refbuttons = function () {
	if (mwCustomEditButtons && (document.getElementById('toolbar') || document.getElementById('wikiEditor-ui-toolbar'))/* && wikEdAutoUpdateUrl == null*/) {
		if (document.getElementById('toolbar')) {
			var button = document.createElement('a');
			button.href = "javascript:refsTB.easyCiteMain()";
			button.title = "Wstaw szablon cytowania (wer: "+refsTB.version+")";
			buttonimage = document.createElement('img');
			buttonimage.src = "//upload.wikimedia.org/wikipedia/commons/b/bf/Button_easy_cite_pl.png";
			buttonimage.alt = "Wstaw szablon przypisu";
			button.appendChild(buttonimage);
			document.getElementById('toolbar').appendChild(button);
		} else {
			var advsec = getElementsByClassName(document.getElementById('wikiEditor-ui-toolbar'), "div", "section-advanced")[0];
			var groupel = getElementsByClassName(advsec, "div", "group-insert")[0];
			var buttonimage = document.createElement('img');
			buttonimage.src = "//upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Curly_Brackets_cytuj.svg/22px-Curly_Brackets_cytuj.svg.png";
			buttonimage.alt = "Wstaw szablon cytowania";
			buttonimage.title = "Wstaw szablon cytowania (wer: "+refsTB.version+")";
			buttonimage.className = "tool tool-button";
			buttonimage.style.cssText = "width: 22px; height: 22px; padding-top:2px";
			buttonimage.onclick = refsTB.easyCiteMain;
			groupel.appendChild(buttonimage);
		}
		var citemain = document.createElement('div');
		citemain.style.display = 'none';
		citemain.setAttribute('id', 'citeselect');
		citemain.appendChild( refsTB.addOption("refsTB.citeWeb()", "Strona WWW") );
		citemain.appendChild( refsTB.addOption("refsTB.citeBook()", "Książka") );
		citemain.appendChild( refsTB.addOption("refsTB.citeJournal()", "Pismo") );
		citemain.appendChild( refsTB.addOption("refsTB.citeNamedRef()", "Istniejące przypisy") );
		citemain.appendChild( refsTB.addOption("refsTB.dispErrors()", "Sprawdzenie błędów") );
		citemain.appendChild( refsTB.addOption("refsTB.hideInitial()", "Anuluj") );
		var txtarea = document.getElementById('wpTextbox1');
		txtarea.parentNode.insertBefore(citemain, txtarea);
	}
}

refsTB.addOption = function (script, text) {
	var option = document.createElement('input');
	option.setAttribute('type', 'button');
	option.onclick = new Function(script);
	option.setAttribute("value", text);
	return option;
}

refsTB.hideInitial = function () {
	document.getElementById('citeselect').style.display = 'none';
	refsTB.oldFormHide();
}

refsTB.oldFormHide = function () {
	if (refsTB.numforms != 0) {
		document.getElementById('citediv'+refsTB.numforms).style.display = 'none';
	}
	if (document.getElementById('errorform') != null) {
		document.getElementById('citeselect').removeChild(document.getElementById('errorform'));
	}
}

refsTB.easyCiteMain = function () {
	var elBar = document.getElementById('citeselect');
	if (elBar.style.display == 'none')
	{
		elBar.style.display = '';
	}
	else
	{
		elBar.style.display = 'none';
	}
}

refsTB.getTime = function () {
	var time = new Date();
	var nowdate = time.getUTCDate();
	if (nowdate<10) { nowdate = "0"+ nowdate.toString(); }
	var nowmonth = time.getUTCMonth()+1;
	if (nowmonth<10) { nowmonth = "0"+ nowmonth.toString(); }
	var nowyear = time.getUTCFullYear();
	newtime =	nowyear + '-' + nowmonth + '-' + nowdate;
	return (newtime);
}

refsTB.parseCiteForm = function (form_id) {
	var els = document.getElementById(form_id).getElementsByTagName('input');
	for (var i=0; i<els.length; i++)
	{
		if (els[i].getAttribute('type')!='hidden')
		{
			els[i].setAttribute('tabindex', 100+i);
		}
		if (els[i].getAttribute('type')=='text')
		{
			els[i].onkeypress = function(e) {
				if(window.event) // IE
				{
					e = window.event;
				}
				if (e.keyCode == '13') {
					refsTB.addcites();
					return false;
				}
			};
		}
	}
}

refsTB.citeWeb = function () {
	refsTB.oldFormHide();
	template = "cytuj stronę";
	var legend = "Cytowanie strony internetowej";
	newtime = refsTB.getTime();
	refsTB.numforms++;
	var form_el = document.createElement('div');
	form_el.id = 'citediv'+refsTB.numforms;
	form_el.innerHTML =
		'<fieldset><legend>'+legend+'</legend>'+
		'<table cellspacing="5">'+
		'<input type="hidden" value="'+template+'" id="template">'+
		'<tr><td width="120"><label for="url">&nbsp;URL: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="url"></td>'+
		'<td width="120"><label for="tytuł">&nbsp;Tytuł: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tytuł"></td></tr>'+
		'<tr><td width="120"><label for="nazwisko">&nbsp;Nazwisko: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko"></td>'+
		'<td width="120"><label for="imię">&nbsp;Imię: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię"></td></tr>'+
		'<tr><td width="120"><label for="nazwisko2">&nbsp;Nazwisko&nbsp;2.&nbsp;autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko2"></td>'+
		'<td width="120"><label for="imię2">&nbsp;Imię 2. autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię2"></td></tr>'+
		'<tr><td width="120"><label for="autor">&nbsp;Autor: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="autor"></td></tr>'+
		'<td width="120"><label for="data">&nbsp;Data publikacji: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data"></td></tr>'+
		'<tr><td width="120"><label for="work">&nbsp;Praca: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="praca"></td>'+
		'<td width="120"><label for="opublikowany">&nbsp;Wydawca: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="opublikowany"></td></tr>'+
		'<tr><td width="120"><label for="strony">&nbsp;Strony: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="strony"></td>'+
		'<td width="120"><label for="język">&nbsp;Język: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="język"></td></tr>'+
		'<tr><td width="120"><label for="data dostępu">&nbsp;Data dostępu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data dostępu" value="'+ newtime +'"></td>'+
		'<td width="120"><label for="refname">&nbsp;Nazwa przypisu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname"></td></tr>'+
		'</table>'+
		'<input type="button" value="Dodaj przypis" onClick="refsTB.addcites()">'+
	'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
	refsTB.parseCiteForm(form_el.id);
}

refsTB.citeBook = function () {
	refsTB.oldFormHide();
	template = "cytuj książkę";
	refsTB.numforms++;
	var form_el = document.createElement('div');
	form_el.id = 'citediv'+refsTB.numforms
	form_el.innerHTML =
		'<fieldset><legend>Cytowanie wydawnictw zwartych (książek)</legend>'+
		'<table cellspacing="5">'+
		'<input type="hidden" value="'+template+'" id="template">'+
		'<tr><td width="120"><label for="nazwisko">&nbsp;Nazwisko: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko"></td>'+
		'<td width="120"><label for="imię">&nbsp;Imię: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię"></td></tr>'+
		'<tr><td width="120"><label for="autor">&nbsp;Autor: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="autor"></td></tr>'+
		'<tr><td width="120"><label for="tytuł">&nbsp;Tytuł: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tytuł"></td>'+
		'<tr><td width="120"><label for="wydawca">&nbsp;Wydawnictwo: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wydawca"></td>'+
		'<td width="120"><label for="miejsce">&nbsp;Miejsce wydania: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="miejsce"></td></tr>'+
		'<tr><td width="120"><label for="data">&nbsp;Data publikacji: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data"></td>'+
		'<td width="120"><label for="seria">&nbsp;Tytuł serii: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="seria"></td></tr>'+
		'<tr><td width="120"><label for="strony">&nbsp;Strony: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="strony"></td>'+
		'<tr><td width="120"><label for="isbn">&nbsp;ISBN: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="isbn"></td>'+
		'<td width="120"><label for="refname">&nbsp;Nazwa przypisu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname"></td></tr>'+
		'</table>'+
	'<table cellspacing="5" class="collapsible collapsed noprint" style="background: transparent; width: 100%; border: 1px solid #dddddd;" cellspacing="0" cellpadding="0">'+
	'<tr><th colspan="4">Dodatkowe pola</th></tr>'+
	'<tr><td width="120"><label for="nazwisko2">&nbsp;Nazwisko&nbsp;2.&nbsp;autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko2"></td>'+
		'<td width="120"><label for="imię2">&nbsp;Imię 2. autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię2"></td></tr>'+
	'<tr><td width="120"><label for="nazwisko2">&nbsp;Nazwisko&nbsp;3.&nbsp;autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko3"></td>'+
		'<td width="120"><label for="imię2">&nbsp;Imię 3. autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię3"></td></tr>'+
	'<tr><td width="120"><label for="nazwisko2">&nbsp;Nazwisko&nbsp;4.&nbsp;autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko4"></td>'+
		'<td width="120"><label for="imię2">&nbsp;Imię 4. autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię4"></td></tr>'+
	'<tr><td width="120"><label for="nazwisko2">&nbsp;Nazwisko&nbsp;5.&nbsp;autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko5"></td>'+
		'<td width="120"><label for="imię2">&nbsp;Imię 5. autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię5"></td></tr>'+
		'<tr><td width="120"><label for="inni">&nbsp;Inni: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="inni"></td></tr>'+
		'<tr><td width="120"><label for="tom">&nbsp;Numer tomu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tom"></td>'+
		'<td width="120"><label for="tytuł tomu">&nbsp;Tytuł tomu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tytuł tomu"></td></tr>'+
		'<tr><td width="120"><label for="rozdział">&nbsp;Tytuł rozdziału: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="rozdział"></td></tr>'+
		'<tr><td width="120"><label for="imię r">&nbsp;Imię autora rozdziału: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię r"></td>'+
		'<td width="120"><label for="nazwisko r">&nbsp;Nazwisko autora rozdziału: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko r"></td></tr>'+
		'<tr><td width="120"><label for="url">&nbsp;DOI: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="doi"></td>'+
		'<td width="120"><label for="data dostępu">&nbsp;Data dostępu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data dostępu"></td></tr>'+
		'<tr><td width="120"><label for="url">&nbsp;URL: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="url"></td>'+
		'<td width="120"><label for="oclc">&nbsp;OCLC: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="oclc"></td></tr>'+
	'</table>'+
		'<input type="button" value="Dodaj przypis" onClick="refsTB.addcites()">'+
	'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
	refsTB.parseCiteForm(form_el.id);
	createCollapseButtons();
}

refsTB.citeJournal = function () {
	refsTB.oldFormHide();
	template = "cytuj pismo";
	refsTB.numforms++;
	var form_el = document.createElement('div');
	form_el.id = 'citediv'+refsTB.numforms
	form_el.innerHTML =
		'<fieldset><legend>Cytowanie czasopisma, pracy naukowej, itp.</legend>'+
		'<table cellspacing="5">'+
		'<input type="hidden" value="'+template+'" id="template">'+
		'<tr><td width="120"><label for="nazwisko">&nbsp;Nazwisko: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko"></td>'+
		'<td width="120"><label for="imię">&nbsp;Imię: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię"></td></tr>'+
		'<tr><td width="120"><label for="nazwisko2">&nbsp;Nazwisko&nbsp;2.&nbsp;autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="nazwisko2"></td>'+
		'<td width="120"><label for="imię2">&nbsp;Imię 2. autora: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="imię2"></td></tr>'+
		'<tr><td width="120"><label for="autor">&nbsp;Autor: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="autor"></td></tr>'+
		'<tr><td width="120"><label for="tytuł">&nbsp;Tytuł: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tytuł"></td>'+
		'<td width="120"><label for="czasopismo">&nbsp;Czasopismo: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="czasopismo"></td></tr>'+
		'<tr><td width="120"><label for="wydawca">&nbsp;Wydawca: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wydawca"></td>'+
		'<td width="120"><label for="odpowiedzialność">&nbsp;Odpowiedzialność: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="odpowiedzialność"></td></tr>'+
		'<tr><td width="120"><label for="wydanie">&nbsp;Wydanie: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wydanie"></td>'+
		'<td width="120"><label for="wolumin">&nbsp;Wolumin: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wolumin"></td></tr>'+
		'<tr><td width="120"><label for="strony">&nbsp;Strony: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="strony"></td>'+
		'<td width="120"><label for="issn">&nbsp;ISSN: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="issn"></td></tr>'+
		'<tr><td width="120"><label for="oclc">&nbsp;OCLC: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="oclc"></td>'+
		'<td width="120"><label for="język">&nbsp;Język: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="język"></td></tr>'+
		'<tr><td width="120"><label for="data">&nbsp;Data publikacji: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data"></td>'+
		'<td width="120"><label for="url">&nbsp;URL: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="url"></td>'+
		'<tr><td width="120"><label for="url">&nbsp;DOI: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="doi"></td>'+
		'<td width="120"><label for="refname">&nbsp;Nazwa przypisu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname"></td></tr>'+
		'</table>'+
		'<input type="button" value="Dodaj przypis" onClick="refsTB.addcites()">'+
	'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
	refsTB.parseCiteForm(form_el.id);
}

refsTB.addcites = function (template) {
	cites = document.getElementById('citediv'+refsTB.numforms).getElementsByTagName('input');
	var citebegin = '<ref';
	var citename = '';
	var citeinner = '';
	for (var i=0; i<cites.length-1; i++) {
		if (cites[i].value != '' && cites[i].id != "refname" && cites[i].id != "template") {
			citeinner += "|" + cites[i].id + "=" + cites[i].value;
		}
		else if (cites[i].value != '' && cites[i].id == "refname" && cites[i].id != "template") {
			citebegin += ' name="' + cites[i].value + '"';
		}
		else if (cites[i].value != '' && cites[i].id != "refname" && cites[i].id == "template") {
			citename = '>{{' + cites[i].value;
		}
	}
	cite = citebegin + citename + citeinner + "}}</ref>";
	document.getElementById('wpTextbox1').focus();	// focus first
	insertTags(cite, '', '');
	document.getElementById('citediv'+refsTB.numforms).style.display = 'none';
}

refsTB.getNamedRefs = function (calls) {
	if (typeof(wikEdUseWikEd) != 'undefined') {
		if (wikEdUseWikEd == true) {
			WikEdUpdateTextarea();
		}
	}
	text = document.getElementById('wpTextbox1').value;
	var regex;
	if (calls) {
		regex = /< *?ref +?name *?= *?(('([^']*?)')|("([^"]*?)")|([^'"\s]*?[^\/]\b)) *?\/ *?>/gi //'
	} else {
		regex = /< *?ref +?name *?= *?(('([^']*?)')|("([^"]*?)")|([^'"\s]*?[^\/]\b)) *?>/gi //'
	}
	var namedrefs = new Array();
	var i=0;
	var nr=true;
	do {
		ref = regex.exec(text);
		if(ref != null){
			if (ref[5]) {
				namedrefs[i] = ref[5];
			} else if (ref[3]) {
				namedrefs[i] = ref[3];
			} else {
				namedrefs[i] = ref[6];
			}
			i++;
		} else {
			nr=false;
		}
	} while (nr==true);
	return namedrefs;
}

refsTB.citeNamedRef = function () {
	var namedrefs = refsTB.getNamedRefs(false);
	refsTB.oldFormHide();
	refsTB.numforms++;
	var form_el = document.createElement('div');
	form_el.id = 'citediv'+refsTB.numforms;
	if (namedrefs == '') {
		form_el.innerHTML =
			'<fieldset>'+
			'<legend>Przypisy z artykułu</legend>'+
			'Nie znaleziono żadnych przypisów z przypisanymi nazwami (<tt>&lt;ref name="nazwa"&gt;</tt>)'+
			'</fieldset>';
	}
	else
	{
		var form =
			'<fieldset><legend>Przypisy z artykułu</legend>'+
			'<table cellspacing="5">'+
			'<tr><td><label for="namedrefs">&nbsp;Nazwane przypisy</label></td>'+
						'<td><select name="namedrefs" id="namedrefs">';
		for (var i=0;i<namedrefs.length;i++) {
			form+= '<option value="'+namedrefs[i]+'">'+namedrefs[i]+'</option>';
		}
		form+= '</select>'+
			'</td></tr></table>'+
			'<input type="button" value="Dodaj przypis" onClick="refsTB.addnamedcite()">'+
			'</fieldset>';
		form_el.innerHTML = form;
	}
	document.getElementById('citeselect').appendChild(form_el);
}

refsTB.addnamedcite = function () {
	name = document.getElementById('citediv'+refsTB.numforms).getElementsByTagName('select')[0].value;
	ref = '<ref name="'+name+'" />';
	document.getElementById('wpTextbox1').focus();	// focus first
	insertTags(ref, '', '');
	document.getElementById('citediv'+refsTB.numforms).style.display = 'none';	
}

refsTB.getAllRefs = function () {
	if (typeof(wikEdUseWikEd) != 'undefined') {
		if (wikEdUseWikEd == true) {
			WikEdUpdateTextarea();
		}
	}
	text = document.getElementById('wpTextbox1').value;
	regex = /< *?ref( +?name *?= *?(('([^']*?)')|("([^"]*?)")|([^'"\s]*?[^\/]\b)))? *?>((.|\n)*?)< *?\/? *?ref *?>/gim //"
	var allrefs = new Array();
	var i=0;
	var nr=true;
	do {
		ref = regex.exec(text);
		if(ref != null){
			var orig_code = ref[0];
			if (ref[0].search(/[^\s]{150}/) != -1) {
				ref[0] = ref[0].replace(/\|([^\s])/g, "| $1");
			}
			ref[0] = ref[0].replace(/</g, "&lt;");
			ref[0] = ref[0].replace(/>/g, "&gt;");
			allrefs[i] = {code : ref[0], index : ref.index, orig_code: orig_code};
			i++;
		} else {
			nr=false;
		}
	} while (nr==true);
	return allrefs;
}

refsTB.NRcallError = function (namedrefs, refname) {
	for (var i=0; i<namedrefs.length; i++) {
		if (namedrefs[i] == refname) {
			return true;
		}
	}
	return false;
}

refsTB.gotoErrorCode = function (code) {
	code = decodeURIComponent(code);
	var input = document.getElementById('wpTextbox1');
	var pos=-1;
	// already selected? => get next
	if (sel_t.getSelStr(input, false)==code)
	{
		sel_pos = sel_t.getSelBound(input);
		pos = input.value.indexOf(code, sel_pos.start+1);
	}
	// not selected yet or last found => get first
	if (pos==-1)
	{
		pos = input.value.indexOf(code);
	}
	// select if found
	if (pos!=-1)
	{
		sel_t.setSelBound(input, {start:pos, end:(pos+code.length)}, true);
	}
}
refsTB.gotoErrorCodeHTML = function (code) {
	var search_icon = '//upload.wikimedia.org/wikipedia/commons/thumb/3/33/Crystal_Clear_action_viewmag.png/20px-Crystal_Clear_action_viewmag.png';
	var el = document.getElementById('wpTextbox1')
	return '<img'
		+ ' style="margin:0 .3em; float:right;"'
		+ ' src="'+search_icon+'" alt="szukaj"'
		+ ' onclick="refsTB.gotoErrorCode(\''+encodeURIComponent(code)+'\')"'
		+ ' />'
	;
}
refsTB.errorCheck = function () {
	var allrefs = refsTB.getAllRefs();
	var allrefscontent = new Array();
	var samecontentexclude = new Array();
	var sx=0;
	var templateexclude = new Array();
	var tx=0;
	var skipcheck = false;
	var namedrefcalls = refsTB.getNamedRefs(true);
	for (var i=0; i<allrefs.length; i++) {
		allrefscontent[i] = allrefs[i].code.replace(/&lt; *?ref( +?name *?= *?(('([^']*?)')|("([^"]*?)")|([^'"\s]*?[^\/]\b)))? *?&gt;((.|\n)*?)&lt; *?\/? *?ref *?&gt;/gim, "$8");	//"
	}
	var namedrefs = refsTB.getNamedRefs(false);
	var errorlist = new Array();
	var q=0;
	unclosed = document.getElementById('unclosed').checked;
	samecontent = document.getElementById('samecontent').checked;
	templates = document.getElementById('templates').checked;
	repeated = document.getElementById('repeated').checked;
	undef = document.getElementById('undef').checked;
	for (var i=0; i<allrefs.length; i++) {
		if (allrefs[i].code.search(/&lt; *?\/ *?ref *?&gt;/) == -1 && unclosed) {
			errorlist[q] = '<tr><td width="75%"><tt>'+allrefs[i].code+'</tt>'+refsTB.gotoErrorCodeHTML(allrefs[i].orig_code)+'</td>';
			errorlist[q] += '<td width="25%">Niedomknięty tag <tt>&lt;ref&gt;</tt></td></tr>';
			q++;
		}
		if (samecontent) {
			for (var d=0; d<samecontentexclude.length; d++) {
				if (allrefscontent[i] == samecontentexclude[d]) {
					skipcheck = true;
				}
			}
			var p=0;
			while (p<allrefs.length && !skipcheck) {
				if (allrefscontent[i] == allrefscontent[p] && i != p) {
					errorlist[q] = '<tr><td width="75%"><tt>'+allrefscontent[i]+'</tt>'+refsTB.gotoErrorCodeHTML(allrefs[i].orig_code)+'</td>';
					errorlist[q] += '<td width="25%">Wiele przypisów posiada tę zawartość. Do tego przypisu powinna zostać przypisana <a target="_blank" href="//pl.wikipedia.org/wiki/Pomoc:Przypisy#Wielokrotne_u.C5.BCycie_jednego_odno.C5.9Bnika">nazwa</a>.</td></tr>';
					q++;
					samecontentexclude[sx] = allrefscontent[i]
					sx++;
					break;
				}
				p++;
			}
		skipcheck=false;
		}
		if (templates) {
			if (allrefscontent[i].search(/\{\{cytuj/i) == -1 && allrefscontent[i].search(/\{\{cite/i) == -1) {
				for (var x=0; x<templateexclude.length; x++) {
					if (allrefscontent[i] == templateexclude[x]) {
						skipcheck = true;
					}
				}
				if (!skipcheck) {
					errorlist[q] = '<tr><td width="75%"><tt>'+allrefs[i].code+'</tt>'+refsTB.gotoErrorCodeHTML(allrefs[i].orig_code)+'</td>';
					errorlist[q] += '<td width="25%">Przypis nie wykorzystuje szablonów cytowania</td></tr>';
					q++;
					templateexclude[tx] = allrefscontent[i];
					tx++;
				}
				skipcheck = false;
			}	
		}
	}
	if (repeated) {
		var repeatnameexclude = new Array();
		var rx=0;
		for (var k=0; k<namedrefs.length; k++) {
			for (var d=0; d<repeatnameexclude.length; d++) {
				if (namedrefs[k] == repeatnameexclude[d]) {
					skipcheck = true;
				}
			}
			var z=0;
			while (z<namedrefs.length && !skipcheck) {
				if (namedrefs[k] == namedrefs[z] && k != z) {
					errorlist[q] = '<tr><td width="75%"><tt>'+namedrefs[k]+'</tt></td>';
					errorlist[q] += '<td width="25%">Kilka różnych przypisów posiada <a target="_blank" href="//pl.wikipedia.org/wiki/Pomoc:Przypisy#Wielokrotne_u.C5.BCycie_jednego_odno.C5.9Bnika">tę samą nazwę</a>.</td></tr>';
					q++;
					repeatnameexclude[rx] = namedrefs[z];
					rx++;
					break;
				}
				z++;
			}
			skipcheck = false;
		}
	}
	if (undef) {
		var undefexclude = new Array();
		var ux=0;
		for (var p=0; p<namedrefcalls.length; p++) {
			for (var d=0; d<undefexclude.length; d++) {
				if (allrefscontent[i] == undefexclude[d]) {
					skipcheck = true;
				}
			}
			if (!skipcheck) {
				if (!refsTB.NRcallError(namedrefs, namedrefcalls[p])) {
					errorlist[q] = '<tr><td width="75%"><tt>'+namedrefcalls[p]+'</tt></td>';
					errorlist[q] += '<td width="25%">Użyty przypis nie został wcześniej <a target="_blank" href="//pl.wikipedia.org/wiki/Pomoc:Przypisy#Wielokrotne_u.C5.BCycie_jednego_odno.C5.9Bnika">zdefiniowany</a>.</td></tr>';
					q++;
					undefexclude[ux] = namedrefs[p];
					ux++;
				}
			}
			skipcheck = false;
		}
 }
	if (q > 0) {
		return errorlist;
	} else {
		return 0;
	}
}

refsTB.dispErrors = function () {
	refsTB.oldFormHide();
	var form_el = document.createElement('div');
	form_el.id = 'errorform';
	form_el.innerHTML = '<fieldset>'+
		'<legend>Sprawdzanie błędów</legend>'+
		'<b>Sprawdź:</b><br/>'+
		'<input type="checkbox" id="unclosed" checked="checked" /> Niedomknięte tagi <tt>&lt;ref&gt;</tt><br/>'+
		'<input type="checkbox" id="samecontent" checked="checked" /> Przypisy z tymi samymi danymi<br/>'+
		'<input type="checkbox" id="templates" checked="checked" /> Przypisy niewykorzystujące szablonów cytowania<br/>'+
		'<input type="checkbox" id="repeated" checked="checked" /> Powtórzone przypisy o tej samej nazwie<br/>'+
		'<input type="checkbox" id="undef" checked="checked" /> Użycie nazwanych przypisów bez treści/definicji<br/>'+
		'<input type="button" id="errorchecksubmit" value="Sprawdzenie pod kątem wybranych błędów" onclick="refsTB.doErrorCheck()"/>'+
		'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
}

refsTB.doErrorCheck = function () {
	var errors = refsTB.errorCheck();
	document.getElementById('citeselect').removeChild(document.getElementById('errorform'));
	if (errors == 0) {
		if (refsTB.numforms != 0) {
			document.getElementById('citediv'+refsTB.numforms).style.display = 'none';
		}
		refsTB.numforms++;
		var form_el = document.createElement('div');
		form_el.id = 'citediv'+refsTB.numforms;
		form_el.innerHTML = '<fieldset>'+
			'<legend>Sprawdzanie błędów</legend>Nie znaleziono żadnych błędów.</fieldset>';
		document.getElementById('citeselect').appendChild(form_el);
	}
	else {
		if (refsTB.numforms != 0) {
			document.getElementById('citediv'+refsTB.numforms).style.display = 'none';
		}
		refsTB.numforms++;
		var form_el = document.createElement('div');
		form_el.id = 'citediv'+refsTB.numforms;
		var form =
			'<fieldset><legend>Sprawdzanie błędów</legend>'+
			'<table border="1px">';
		for (var i=0; i<errors.length; i++) {
			form+=errors[i];
		}
		form+= '</table>'+
			'</fieldset>';
		form_el.innerHTML = form
		document.getElementById('citeselect').appendChild(form_el);
	}
}


mw.loader.using( "mediawiki.legacy.wikibits", function() {
	hookEvent( 'load', function() {
		refsTB.refbuttons();
	} );
} );
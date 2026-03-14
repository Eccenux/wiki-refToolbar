/* ------------------------------------------------------------------------ *\
  Copyright: en:User:Mr.Z-man (en), Wikipedysta:Holek (pl), pl:User:Nux
   Licencja: GFDL oraz CC-BY-SA

  Original:
	http://en.wikipedia.org/wiki/User:Mr.Z-man/refToolbar.js

  Version:
    (see below) = refsTB.version
\* ------------------------------------------------------------------------ */
// <nowiki>
/* globals sel_t, toolbarGadget */
/* globals createCollapseButtons */
/* globals wikEdUseWikEd, WikEdUpdateTextarea */
/* globals refsTB */
/* eslint-disable no-useless-escape */
/* eslint-disable no-redeclare */

//
// Object Init
//
if (document.cookie.indexOf("js_refsTB_critical=1")==-1 && window.refsTB!==undefined)
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

window.refsTB = {
	/** Version of the gadget */
	version: '1.4.0a',
	/** Number of forms */
	numforms: 0,

	/** Sets up the gadget */
	init: function() {
		var that = this;
		if ( typeof toolbarGadget === 'undefined' ) {
			console.warn('toolbarGadget not ready yet');
			return;
		}

		toolbarGadget.addButton( {
			title: 'Wstaw szablon cytowania (wer. ' + that.version + ')',
			alt: 'Wstaw szablon cytowania',
			add_style: "width: 38px;",
			add_class: 'skin-invert',
			oldIcon: '//upload.wikimedia.org/wikipedia/commons/b/bf/Button_easy_cite_pl.png',
			newIcon: '//upload.wikimedia.org/wikipedia/commons/e/ed/Cytuj.png',
			onclick: function() {
				that.easyCiteMain();
			}
		} );
	},
	/** Shows and hides the form */
	easyCiteMain: function() {
		var citemain = document.getElementById( 'citeselect' );

		if ( !citemain ) {
			// Create the buttons
			citemain = document.createElement( 'div' );
			citemain.style.display = 'none';
			citemain.setAttribute( 'id', 'citeselect' );
			citemain.appendChild( this.addOption( "refsTB.citeWeb()", "Strona WWW" ) );
			citemain.appendChild( this.addOption( "refsTB.citeBook()", "Książka" ) );
			citemain.appendChild( this.addOption( "refsTB.citeJournal()", "Pismo" ) );
			citemain.appendChild( this.addOption( "refsTB.citeAnything()", "Uniwersalny" ) );
			citemain.appendChild( this.addOption( "refsTB.citeNamedRef()", "Istniejące przypisy" ) );
			citemain.appendChild( this.addOption( "refsTB.dispErrors()", "Sprawdzenie błędów" ) );
			citemain.appendChild( this.addOption( "refsTB.hideInitial()", "Anuluj" ) );
			var topEditor = document.querySelector('.wikiEditor-ui-top');
			if (topEditor instanceof Element) {
				topEditor.appendChild(citemain);
			} else {
				var txtarea = document.getElementById( 'wpTextbox1' );
				txtarea.parentNode.insertBefore( citemain, txtarea );
			}
		}
		if ( citemain.style.display == 'none' ) {
			refsTB.citeMainShow();
		} else {
			refsTB.citeMainHide();
		}
	}
};


//
// Methods
//
/** Show main panel. */
refsTB.citeMainShow = function () {
	var citemain = document.getElementById('citeselect');
	$('fieldset [disabled]', citemain).each(function(){$(this).removeAttr('disabled')});
	citemain.style.display = '';
}
/** Hide main panel. */
refsTB.citeMainHide = function () {
	var citemain = document.getElementById('citeselect');
	citemain.style.display = 'none';
	$('fieldset :invalid', citemain).each(function(){$(this).attr('disabled', 'true')});
}
/** Hide just the current form. */
refsTB.citeCurrentHide = function () {
	var form = document.getElementById('citediv'+refsTB.numforms);
	form.style.display = 'none';
	$(':invalid', form).each(function(){$(this).attr('disabled', 'true')});
}

refsTB.addOption = function (script, text) {
	var option = document.createElement('input');
	option.setAttribute('type', 'button');
	option.onclick = new Function(script);
	option.setAttribute("value", text);
	return option;
}

refsTB.hideInitial = function () {
	refsTB.citeMainHide();
	refsTB.oldFormHide();
}

refsTB.oldFormHide = function () {
	if (refsTB.numforms !== 0) {
		refsTB.citeCurrentHide();
	}
	if (document.getElementById('errorform') !== null) {
		document.getElementById('citeselect').removeChild(document.getElementById('errorform'));
	}
}

/** Get current date in ISO format */
refsTB.getTime = function () {
	var time = new Date();
	var nowdate = time.getUTCDate();
	if (nowdate<10) { nowdate = "0"+ nowdate.toString(); }
	var nowmonth = time.getUTCMonth()+1;
	if (nowmonth<10) { nowmonth = "0"+ nowmonth.toString(); }
	var nowyear = time.getUTCFullYear();
	var newtime =	nowyear + '-' + nowmonth + '-' + nowdate;
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
	var template = "Cytuj stronę";
	var legend = "Cytowanie strony internetowej";
	refsTB.numforms++;
	var form_el = document.createElement('div');
	form_el.id = 'citediv'+refsTB.numforms;
	form_el.innerHTML =
		'<fieldset><legend>'+legend+'</legend>'+
		'<table cellspacing="5">'+
		'<input type="hidden" value="'+template+'" id="template">'+
		'<tr><td width="120"><label for="url">&nbsp;URL: </label></td>'+
			'<td width="400"><input type="url" style="width:100%" id="url" required></td>'+
		'<td width="120"><label for="tytuł">&nbsp;Tytuł: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tytuł" required></td></tr>'+
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
			'<td width="400"><input type="text" style="width:100%" id="data dostępu" value="'+ refsTB.getTime() +'"></td>'+
		'<td width="120"><label for="refname">&nbsp;Nazwa przypisu<sup>*</sup>: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname" placeholder="wpisz * aby wstawić szablon bez znaczników &lt;ref&gt;"></td></tr>'+
		'<tr><td width="120"><label for="archiwum">&nbsp;Archiwum: </label></td>'+
			'<td width="400"><input type="url" style="width:100%" id="archiwum"></td>'+
		'<td width="120"><label for="zarchiwizowano">&nbsp;Data archiwizacji: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="zarchiwizowano"></td></tr>'+
		'</table>'+
		'<input type="button" value="Dodaj przypis" onClick="refsTB.addcites()">'+
	'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
	refsTB.parseCiteForm(form_el.id);
}

refsTB.citeBook = function () {
	refsTB.oldFormHide();
	var template = "Cytuj książkę";
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
			'<td width="400"><input type="text" style="width:100%" id="autor"></td>'+
		'<td width="120"><label for="autor link">&nbsp;Artykuł o autorze: </label></td>'+
			'<td width="400" title="Nazwa artykułu w Wikipedii omawiającego tę osobę."><input type="text" style="width:100%" id="autor link"></td></tr>'+
		'<tr><td width="120"><label for="tytuł">&nbsp;Tytuł: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="tytuł" required></td>'+
		'<td width="120"><label for="wydanie">&nbsp;Wydanie: </label></td>'+
			'<td width="400" title="Cytowane wydanie. Używane, jeżeli nie była to pierwsza publikacja książki."><input type="text" style="width:100%" id="wydanie"></td></tr>'+
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
		'<td width="120"><label for="kolumny">&nbsp;Kolumny: </label></td>'+
			'<td width="400" title="Dla publikacji, które mają wiele szpalt (kolumn)."><input type="text" style="width:100%" id="kolumny"></td></tr>'+
		'<tr><td width="120"><label for="isbn">&nbsp;ISBN: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="isbn"></td>'+
		'<td width="120"><label for="refname">&nbsp;Nazwa przypisu<sup>*</sup>: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname" placeholder="wpisz * aby wstawić szablon bez znaczników &lt;ref&gt;"></td></tr>'+
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
			'<td width="400"><input type="text" style="width:100%" id="data dostępu" value="'+ refsTB.getTime() +'"></td></tr>'+
		'<tr><td width="120"><label for="url">&nbsp;URL: </label></td>'+
			'<td width="400"><input type="url" style="width:100%" id="url"></td>'+
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
	var template = "Cytuj pismo";
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
			'<td width="400"><input type="text" style="width:100%" id="tytuł" required></td>'+
		'<td width="120"><label for="czasopismo">&nbsp;Czasopismo: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="czasopismo" required></td></tr>'+
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
			'<td width="400"><input type="url" style="width:100%" id="url"></td>'+
		'<tr><td width="120"><label for="url">&nbsp;DOI: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="doi"></td>'+
		'<td width="120"><label for="refname">&nbsp;Nazwa przypisu<sup>*</sup>: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname" placeholder="wpisz * aby wstawić szablon bez znaczników &lt;ref&gt;"></td></tr>'+
		'</table>'+
		'<input type="button" value="Dodaj przypis" onClick="refsTB.addcites()">'+
	'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
	refsTB.parseCiteForm(form_el.id);
}

refsTB.citeAnything = function () {
	refsTB.oldFormHide();
	var template = "Cytuj";
	refsTB.numforms++;
	var form_el = document.createElement('div');
	form_el.id = 'citediv'+refsTB.numforms
	form_el.innerHTML =
		'<fieldset><legend>Uniwersalne cytowanie wszelkich publikacji</legend>'+
		'<table cellspacing="5">'+
		'<input type="hidden" value="'+template+'" id="template">'+
		'<tr><td width="120"><label for="autor">&nbsp;Autor: </label></td>'+
			'<td colspan="3"><input type="text" style="width:100%" id="autor" title="Lista autorów w postaci \'Imię Nazwisko\' z opcjonalnym wikilinkiem ([[Imię Nazwisko]])"></td></tr>'+
		'<tr><td width="120"><label for="tytuł">&nbsp;Tytuł: </label></td>'+
			'<td colspan="3"><input type="text" style="width:100%" id="tytuł" required title="Można stosować zewnętrzny wikilink ([url tytuł]) jeśli cytowana jest strona internetowa, albo wewnętrzny ([[tytuł]]) jeśli publikacja ma oddzielny artykuł"></td></tr>'+
		'<tr><td width="120"><label for="url">&nbsp;URL: </label></td>'+
			'<td width="400"><input type="url" style="width:100%" id="url"></td>'+
		'<td width="120"><label for="redaktor">&nbsp;Redaktor: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="redaktor" title="Lista redaktorów w postaci \'Imię Nazwisko\' z opcjonalnym wikilinkiem ([[Imię Nazwisko]])"></td></tr>'+
		'<tr><td width="120"><label for="czasopismo">&nbsp;Czasopismo: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="czasopismo"></td>'+
		'<td width="120"><label for="odpowiedzialność">&nbsp;Odpowiedzialność: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="odpowiedzialność"></td></tr>'+
		'<tr><td width="120"><label for="wolumin">&nbsp;Wolumin/tom: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wolumin"></td>'+
		'<td width="120"><label for="numer">&nbsp;Numer: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="numer"></td></tr>'+
		'<tr><td width="120"><label for="wydanie">&nbsp;Wydanie: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wydanie"></td>'+
		'<td width="120"><label for="miejsce">&nbsp;Miejsce wydania: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="miejsce"></td></tr>'+
		'<tr><td width="120"><label for="wydawca">&nbsp;Wydawca: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="wydawca"></td>'+
		'<td width="120"><label for="opublikowany">&nbsp;Opublikowany <small>(www)</small>: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="opublikowany"></td></tr>'+
		'<tr><td width="120"><label for="data">&nbsp;Data publikacji: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data"></td>'+
		'<td width="120"><label for="s">&nbsp;Strony, kolumny: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="s"></td></tr>'+
		'<tr><td width="120"><label for="data dostępu">&nbsp;Data dostępu: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="data dostępu" value="'+ refsTB.getTime() +'"></td>'+
		'<td width="120"><label for="opis">&nbsp;Opis: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="opis"></td></tr>'+
		'<tr><td width="120"><label for="isbn">&nbsp;ISBN: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="isbn"></td>'+
		'<td width="120"><label for="issn">&nbsp;ISSN: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="issn"></td></tr>'+
		'<tr><td width="120"><label for="oclc">&nbsp;OCLC: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="oclc"></td>'+
		'<td width="120"><label for="doi">&nbsp;DOI: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="doi"></td></tr>'+
		'<tr><td width="120"><label for="pmid">&nbsp;PMID: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="pmid"></td>'+
		'<td width="120"><label for="język">&nbsp;Język: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="język"></td></tr>'+
		'<tr><td width="120"><label for="refname">&nbsp;Nazwa przypisu<sup>*</sup>: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="refname" placeholder="wpisz * aby wstawić szablon bez znaczników &lt;ref&gt;"></td></tr>'+
		'<tr><td colspan="5">'+
	'<table cellspacing="5" class="collapsible collapsed noprint" style="background: transparent; width: 100%; border: 1px solid #dddddd;" cellspacing="0" cellpadding="0">'+
	'<tr><th colspan="4">Dodatkowe pola</th></tr>'+
	'<tr><td width="120"><label for="autor r">&nbsp;Autor rozdziału: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="autor r"></td>'+
		'<td width="120"><label for="rozdział">&nbsp;Rozdział: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="rozdział"></td></tr>'+
	'<tr><td width="120"><label for="inni">&nbsp;Inni: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="inni"></td>'+
		'<td width="120"><label for="praca">&nbsp;Praca <small>(www)</small>: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="praca"></td></tr>'+
	'<tr><td width="120"><label for="pcm">&nbsp;PMC: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="pmc"></td>'+
		'<td width="120"><label for="bibcode">&nbsp;Bibcode: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="bibcode"></td></tr>'+
	'<tr><td width="120"><label for="lccn">&nbsp;LCCN: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="lccn"></td>'+
		'<td width="120"><label for="id">&nbsp;Inny identyfikator: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="id"></td></tr>'+
	'<tr><td width="120"><label for="archiwum">&nbsp;Archiwum: </label></td>'+
			'<td width="400"><input type="url" style="width:100%" id="archiwum"></td>'+
		'<td width="120"><label for="zarchiwizowano">&nbsp;Data archiwizacji: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="zarchiwizowano"></td></tr>'+
	'<tr><td width="120"><label for="cytat">&nbsp;Cytat: </label></td>'+
		'<td width="400" colspan="3"><input type="text" style="width:100%" id="cytat"></td></tr>'+
	'<tr><td width="120"><label for="typ nośnika">&nbsp;Typ nośnika: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="typ nośnika"></td>'+
		'<td width="120"><label for="odn">&nbsp;Odnośnik: </label></td>'+
			'<td width="400"><input type="text" style="width:100%" id="odn"></td></tr>'+
	'</table>'+
		'</td></tr>'+
		'</table>'+
		'<input type="button" value="Dodaj przypis" onClick="refsTB.addcites()">'+
	'</fieldset>';
	document.getElementById('citeselect').appendChild(form_el);
	refsTB.parseCiteForm(form_el.id);
	createCollapseButtons();
}

/** Add single ref. */
refsTB.addcites = function () {
	var cites = document.getElementById('citediv'+refsTB.numforms).getElementsByTagName('input');
	
	// to key:value map
	var values = {};
	for (var i=0; i<cites.length-1; i++) {
		if (cites[i].value == '') {
			continue;
		}
		values[cites[i].id] = cites[i].value;
	}

	// filter invalid
	if (!('url' in values) && 'data dostępu' in values) {
		delete values['data dostępu'];
	}

	// create ref
	var citebegin = '<ref';
	var citename = '';
	var citeclose = '>';
	var citeinner = '';
	var citeend = '</ref>';
	for (var id in values) {
		if (!Object.hasOwnProperty.call(values, id)) {
			continue
		}
		var value = values[id];

		switch (id) {
			case 'refname':
				if (value == '*') {
					citebegin = '';
					citeclose = '* ';
					citeend = '';
				} else {
					citebegin += ' name="' + value + '"';
				}
				break;
			case 'template':
				citename = '{{' + value;
				break;
			default:
				citeinner += " | " + id + " = " + value;
				break;
		}
	}
	var cite = citebegin + citeclose + citename + citeinner + "}}" + citeend;
	document.getElementById('wpTextbox1').focus();	// focus first
	$('#wpTextbox1').textSelection('encapsulateSelection', {pre: cite});
	refsTB.citeCurrentHide();
}

refsTB.getNamedRefs = function (calls) {
	if (typeof(wikEdUseWikEd) != 'undefined') {
		if (wikEdUseWikEd == true) {
			WikEdUpdateTextarea();
		}
	}
	var text = document.getElementById('wpTextbox1').value;
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
		var ref = regex.exec(text);
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
	var citeform = document.getElementById('citediv'+refsTB.numforms);
	var name = citeform.getElementsByTagName('select')[0].value;
	var ref;
	var $textbox = $('#wpTextbox1');
	if ($textbox.val().search(/\{\{[rR]\|/) >= 0) {
		ref = '{{r|'+name+'}}';
	} else {
		ref = '<ref name="'+name+'" />';
	}
	$textbox.focus();	// focus first
	$textbox.textSelection('encapsulateSelection', {pre: ref});
	refsTB.citeCurrentHide();
}

refsTB.getAllRefs = function () {
	if (typeof(wikEdUseWikEd) != 'undefined') {
		if (wikEdUseWikEd == true) {
			WikEdUpdateTextarea();
		}
	}
	var text = document.getElementById('wpTextbox1').value;
	var regex = /< *?ref( +?name *?= *?(('([^']*?)')|("([^"]*?)")|([^'"\s]*?[^\/]\b)))? *?>((.|\n)*?)< *?\/? *?ref *?>/gim //"
	var allrefs = new Array();
	var i=0;
	var nr=true;
	do {
		var ref = regex.exec(text);
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
		var sel_pos = sel_t.getSelBound(input);
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
	var search_icon = '//upload.wikimedia.org/wikipedia/commons/thumb/a/ad/VisualEditor_-_Icon_-_Search-big.svg/20px-VisualEditor_-_Icon_-_Search-big.svg.png';
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
	var unclosed = document.getElementById('unclosed').checked;
	var samecontent = document.getElementById('samecontent').checked;
	var templates = document.getElementById('templates').checked;
	var repeated = document.getElementById('repeated').checked;
	var undef = document.getElementById('undef').checked;
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
			refsTB.citeCurrentHide();
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
			refsTB.citeCurrentHide();
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

mw.loader.using( [ "ext.gadget.lib-toolbar", "ext.gadget.NavFrame" ] , function() {
	refsTB.init();
} );
// </nowiki>
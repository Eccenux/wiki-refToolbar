## refToolbar

Instrukcja:
https://pl.wikipedia.org/wiki/Wikipedia:Narz%C4%99dzia/refToolbar

Skrypt zaimportowany z wiki na GitHub za pomocą wiki2git:
https://pl.wikipedia.org/wiki/Wikipedia:Wiki-to-Git#Przyk%C5%82ad_u%C5%BCycia

Wdrażany z powrotem za pomocą Wikiploy:
https://github.com/Eccenux/wikiploy-rollout-example?tab=readme-ov-file#quick-start

TODO v1.4:
- [x] Obsługa podprzypisów.
	- [x] Możliwość reuse pp.
	- [x] Możliwość dodania `details` przy reuse.
- [x] Przy zmianie tabów nie powinno czyścić formularza.
	- [x] Tworzenie jednego formularza jednego typu.
	- [x] Sprawdzenie czy formularz już istnieje i nie nadpisywanie go.
	- [x] Okienka dialogowe (żeby formularze były poza formularzem edycji).
	- [x] Przycisk resetu.
	- [x] Przetestować zapis formularzy przy niepoprawnych polach.
TODO v1.6?:
- [] Zabezpieczenie errorCheck (html?).
- [] W duplikatach/szukaniu błędów nie powinno brać pod uwagę kodu (syntax, nowiki itp).
- [] Usunąć zależność do NavFrame? (`createCollapseButtons();`, `class="collapsible...`).


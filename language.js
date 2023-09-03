class Language {
  getInfo() {
    return {
      id: 'language',
      name: 'Language',
      blocks: [
        {
          opcode: 'lang',
          blockType: Scratch.BlockType.REPORTER,
          text: 'navigator language'
        }
      ]
    };
  }

  lang() {
	  const userLocale =
		navigator.languages && navigator.languages.length
		? navigator.languages[0]
		: navigator.language;

		console.log(userLocale);
		return userLocale;
  }
}

Scratch.extensions.register(new HelloWorld());

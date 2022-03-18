export enum Pronoun {
  /** Birinci Tekil Şahıs */
  SingularFirst,
  /** İkinci Tekil Şahıs */
  SingularSecond,
  /** Üçüncü Tekil Şahıs */
  SingularThird,
  /** Birinci Çoğul Şahıs */
  PluralFirst,
  /** İkinci Çoğul Şahıs */
  PluralSecond,
  /** Üçüncü Çoğul Şahıs */
  PluralThird,
}

export enum Case {
  /** İsmin Yalın Hâli - */
  Absolute,
  /** İsmin Belirtme Hâli -i */
  Accusative,
  /** İsmin Ayrılma Hâli -den */
  Ablative,
  /** İsmin Bulunma Hâli -de */
  Locative,
  /** İsmin Vasıta Hâli -ile */
  Instrumental,
  /** İsmin Yönelme Hâli -e */
  Dative,
}

interface Util {
  duplicateToUppercase: (list: string[]) => string[];
  getComponents: (base: string) => WordComponent;
  getSyllableCount: (base: string) => number;
  concat: (base: string, affix: Affix, isProperNoun?: boolean) => string;
}

export interface WordComponent {
  letter: string;
  vowel: string;
  syllableCount: number;
}

export interface Affix {
  prefix: string;
  infix: string;
  suffix: string;
}

export const util: Util = {
  duplicateToUppercase: (list: string[]): string[] => {
    const copy = [...list];
    return [...list, ...copy.map((item) => item.toLocaleUpperCase())];
  },
  getComponents: (base: string): WordComponent => {
    const input = base.split('').reverse().join('');

    let index = 0;
    const letter = input[0].toLocaleLowerCase();
    let vowel = input[index].toLocaleLowerCase();

    while (!sounds.vowels.includes(vowel)) {
      index++;
      vowel = input[index].toLocaleLowerCase();
    }

    let syllableCount = 0;

    base.split('').forEach((letter) => {
      if (sounds.vowels.includes(letter)) syllableCount++;
    });

    return { letter, vowel, syllableCount };
  },
  getSyllableCount: (base: string): number => {
    let count = 0;
    const input = base.split('');

    input.forEach((letter) => {
      if (sounds.vowels.includes(letter)) count++;
    });

    return count;
  },
  concat: (base: string, affix: Affix, isProperNoun: boolean = false): string => {
    const punctuation = isProperNoun ? "'" : '';
    return affix.prefix + base + punctuation + affix.infix + affix.suffix;
  },
};

export const sounds = {
  unvoicedStoppingConsonants: util.duplicateToUppercase(['p', 'ç', 't', 'k']),
  unvoicedContinuousConsonants: util.duplicateToUppercase(['f', 's', 'ş', 'h']),
  voicedStoppingConsonants: util.duplicateToUppercase(['b', 'c', 'd', 'ğ']),
  concatentorConsonants: util.duplicateToUppercase(['y', 'ş', 's', 'n']),
  unvoicedConsonants: util.duplicateToUppercase(['f', 's', 'ş', 'h', 'p', 'ç', 't', 'k']),
  roundedVowels: util.duplicateToUppercase(['o', 'u', 'ö', 'ü']),
  unRoundedVowels: util.duplicateToUppercase(['a', 'ı', 'e', 'i']),
  backVowels: util.duplicateToUppercase(['e', 'i', 'ö', 'ü']),
  frontVowels: util.duplicateToUppercase(['a', 'ı', 'o', 'u']),
  acuteVowels: util.duplicateToUppercase(['ı', 'i', 'u', 'ü']),
  wideVowels: util.duplicateToUppercase(['a', 'e', 'o', 'ö']),
  vowels: util.duplicateToUppercase(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü']),
};

export const exceptions = {
  /** Unvoiced exceptions that does not soften with a vowel suffix immediately after */
  unvoiced: ['hukuk', 'bilet', 'tabiat', 'devlet', 'bisiklet', 'millet', 'ahret', 'ahiret', 'merak'],
  /** Unvoiced single syllable exceptions that does soften with a vowel suffix immediately after */
  unvoicedSingleSyllable: ['uç'],
  /** Unvoiced single syllable exceptions that does soften with a vowel suffix immediately after */
  plural: ['o'],
  /** Limited list of words that drop their vowe upon a cretain condition */
  vowelDrop: [
    'oğul',
    'bağır',
    'beyin',
    'burun',
    'ağız',
    'karın',
    'şehir',
    'nehir',
    'akıl',
    'göğüs',
    'devir',
    'seyir',
    'kayıp',
    'hapis',
    'zulüm',
    'gönül',
    'boyun',
  ],
};

/** Some words that end with an unvoiced consonants (p,ç,t,k) may be converted into their voiced counterparts (b,c,d,ğ).
 * If extist, this function returns the voiced consonant. If not returns undefined -
 * Eğer kelime sert ünsüz ile bitiyorsa, ünsüzün yumuşak halini, bitmiyorsa undefined döndürür
 */
export const getVoicedConsonant = (base: string, isProperNoun: boolean = false): string | undefined => {
  const { letter } = util.getComponents(base);
  if (
    sounds.unvoicedStoppingConsonants.includes(letter) &&
    !isProperNoun &&
    !exceptions.unvoiced.includes(base.toLocaleLowerCase())
  ) {
    const i = sounds.unvoicedStoppingConsonants.indexOf(base[base.length - 1]);
    let voicedCounterPart;

    const isNK =
      base
        .split('')
        .slice(base.length - 2, base.length)
        .join('') === 'nk';
    if (isNK) {
      voicedCounterPart = 'g';
    } else {
      if (util.getSyllableCount(base) > 1 || exceptions.unvoicedSingleSyllable.includes(base.toLocaleLowerCase())) {
        voicedCounterPart = sounds.voicedStoppingConsonants[i];
      }
    }

    return voicedCounterPart;
  }
  return;
};

/** This function returns the mutated version of a word with its voiced consonant. If base does not have a voiced counterpart, the base itself is returned -
 * Kelimenin sonunda sert ünsüz varsa, sert ünsüzü yumuşak haliyle değiştirir, yoksa kelimenin kendisini döndürür
 * 'Renk' -> 'Reng'
 * 'Akıl' -> 'Akıl'
 */
export const alterToVoicedConsonant = (base: string, isProperNoun: boolean = false): string => {
  const voicedCounterPart = getVoicedConsonant(base, isProperNoun);

  if (voicedCounterPart) {
    const result =
      base
        .split('')
        .splice(0, base.length - 1)
        .join('') + voicedCounterPart;
    return result;
  }

  return base;
};

/** Alter given word to its vowel dropped version. If no vowel is supposed to drop, the word itself is returned -
 * Verilen kelimenin hecesi düşmüş versiyonunu döndürür. Eğer kelimede ünlü düşmesi yoksa, kelimenin kendisi döndürülür
 * e.g 'Akıl' -> 'Akl',
 * e.g 'Bebek' -> 'Bebek'
 */
export const alterToVowelDrop = (base: string): string => {
  const { vowel } = util.getComponents(base);
  const word = base.trim();

  if (
    util.getSyllableCount(base) === 2 &&
    sounds.acuteVowels.includes(vowel) &&
    exceptions.vowelDrop.includes(word.toLocaleLowerCase())
  ) {
    // Remove the last vowel e.g 'Akıl' -> 'Akl'
    const result = word.split('').reverse().join('').replace(vowel, '').split('').reverse().join('');
    return result;
  }

  return word;
};

/** Returns the plural suffix for a given word -
 * Verilen kelimenin çoğul ekini dödürür
 */
export const getPluralSuffix = (base: string): Affix => {
  const { vowel } = util.getComponents(base);
  let result: string;
  let infix = '';

  if (sounds.frontVowels.includes(vowel)) {
    result = 'lar';
  } else if (sounds.backVowels.includes(vowel)) {
    result = 'ler';
  } else {
    throw Error('Unknown vowel');
  }

  if (exceptions.plural.includes(base.toLocaleLowerCase())) {
    infix = 'n';
  }

  return { infix, suffix: result, prefix: '' };
};

/** Transforms a given word into plural form -
 * Verilen kelimeyi çoğul hale getirir
 */
export const makePlural = (base: string): string => {
  return util.concat(base, getPluralSuffix(base));
};

/** Returns the equality suffix for a given word -
 * Verilen kelimenin eşitlik ekini dödürür; e.g 'Çocuk' -> 'ça'
 */
export const getEqualitySuffix = (base: string): Affix => {
  const { vowel, letter } = util.getComponents(base);
  let result = '';

  if (sounds.unvoicedConsonants.includes(letter)) {
    result += 'ç';
  } else {
    result += 'c';
  }

  if (sounds.frontVowels.includes(vowel)) {
    result += 'a';
  } else if (sounds.backVowels.includes(vowel)) {
    result += 'e';
  } else {
    throw Error('Unknown vowel');
  }

  return { suffix: result, prefix: '', infix: '' };
};

/** Transforms a given word into equal form -
 * Verilen kelimeye eşitlik ekini ekler; e.g 'Çocuk' -> 'Çocukça'
 */
export const makeEqual = (base: string): string => {
  return util.concat(base, getEqualitySuffix(base));
};

/** Returns the possesive suffix for a given word and pronoun -
 * Verilen kelimeye ve zamire uygun iyelik ekini döndürür
 */
export const getPossesiveSuffix = (base: string, pronoun: Pronoun): Affix => {
  const { vowel, letter } = util.getComponents(base);
  let result = '';
  let infix = '';
  let vowelSuffix: string;

  if (sounds.vowels.includes(letter)) {
    if (pronoun === Pronoun.SingularThird) {
      infix = 's';

      if (sounds.frontVowels.includes(vowel)) {
        if (sounds.roundedVowels.includes(vowel)) {
          result += 'u';
          vowelSuffix = 'u';
        } else {
          result += 'ı';
          vowelSuffix = 'ı';
        }
      } else {
        if (sounds.roundedVowels.includes(vowel)) {
          result += 'ü';
          vowelSuffix = 'ü';
        } else {
          result += 'i';
          vowelSuffix = 'i';
        }
      }
    } else {
      vowelSuffix = '';
    }
  } else {
    if (pronoun !== Pronoun.PluralThird) {
      if (sounds.frontVowels.includes(vowel)) {
        if (sounds.roundedVowels.includes(vowel)) {
          result += 'u';
          vowelSuffix = 'u';
        } else {
          result += 'ı';
          vowelSuffix = 'ı';
        }
      } else {
        if (sounds.roundedVowels.includes(vowel)) {
          result += 'ü';
          vowelSuffix = 'ü';
        } else {
          result += 'i';
          vowelSuffix = 'i';
        }
      }
    } else {
      vowelSuffix = '';
    }
  }

  switch (pronoun) {
    case Pronoun.SingularFirst:
      result += 'm';
      break;
    case Pronoun.SingularSecond:
      result += 'n';
      break;
    case Pronoun.SingularThird:
      break;
    case Pronoun.PluralFirst:
      switch (vowelSuffix) {
        case 'u':
          result += 'muz';
          break;
        case 'ı':
          result += 'mız';
          break;
        case 'ü':
          result += 'müz';
          break;
        case 'i':
          result += 'miz';
          break;
      }
      break;
    case Pronoun.PluralSecond:
      switch (vowelSuffix) {
        case 'u':
          result += 'nuz';
          break;
        case 'ı':
          result += 'nız';
          break;
        case 'ü':
          result += 'nüz';
          break;
        case 'i':
          result += 'niz';
          break;
      }
      break;
    case Pronoun.PluralThird:
      if (sounds.backVowels.includes(vowelSuffix)) {
        result += 'leri';
      } else {
        result += 'ları';
      }
      break;
  }

  return { infix, suffix: result, prefix: '' };
};

/** Concatenates the word with the possesive suffix for a given base and pronoun -
 * Verilen kelimeye ve zamire uygun iyelik ekini ekler
 */
export const makePossesive = (base: string, pronoun: Pronoun, isProperNoun: boolean = false): string => {
  const affix = getPossesiveSuffix(base, pronoun);
  const suffix = affix.infix + affix.suffix;
  const firstLetter = suffix[0];
  let root: string;

  const word = alterToVowelDrop(base);
  if (sounds.vowels.includes(firstLetter)) {
    root = alterToVoicedConsonant(word);
  } else {
    root = word;
  }

  const punctuation = isProperNoun ? "'" : '';
  return root + punctuation + suffix;
};

/** Returns the completion suffix for a given base -
 * Verilen kelimeye uygun tamlayan ekini döndürür; e.g 'Araç' -> 'ın'
 */
export const getCompleteSuffix = (base: string): Affix => {
  const { vowel, letter } = util.getComponents(base);
  let result: string;

  if (sounds.vowels.includes(letter)) {
    result = 'n';
  } else {
    result = '';
  }

  if (sounds.frontVowels.includes(vowel)) {
    if (sounds.roundedVowels.includes(vowel)) {
      result += 'un';
    } else {
      result += 'ın';
    }
  } else {
    if (sounds.roundedVowels.includes(vowel)) {
      result += 'ün';
    } else {
      result += 'in';
    }
  }

  return { infix: '', suffix: result, prefix: '' };
};

/** Concatenates the word with the completion suffix for a given base -
 * Verilen kelimeye uygun tamlayan ekini ekler; e.g 'Araç' -> 'Aracın'
 */
export const makeComplete = (base: string, isProperNoun: boolean = false): string => {
  const affix = getCompleteSuffix(base);
  const suffix = affix.infix + affix.suffix;
  const firstLetter = suffix[0];
  let root: string;

  const word = alterToVowelDrop(base);
  if (sounds.vowels.includes(firstLetter)) {
    root = alterToVoicedConsonant(word);
  } else {
    root = word;
  }

  const punctuation = isProperNoun ? "'" : '';
  return root + punctuation + suffix;
};

/** Returns the appropriate case suffix for a given base word and a case -
 * Verilen kelimeye ve hâle uygun hâl ekini döndürür.
 */
export const getCaseSuffix = (base: string, _case: Case): Affix => {
  const { vowel, letter } = util.getComponents(base);
  let result: string;
  let infix = '';

  switch (_case) {
    case Case.Absolute:
      result = '';
      break;
    case Case.Accusative:
      if (sounds.vowels.includes(letter)) {
        infix = 'n';
      }

      if (sounds.frontVowels.includes(vowel)) {
        if (sounds.roundedVowels.includes(vowel)) {
          result = 'u';
        } else {
          result = 'ı';
        }
      } else {
        if (sounds.roundedVowels.includes(vowel)) {
          result = 'ü';
        } else {
          result = 'i';
        }
      }
      break;
    case Case.Ablative:
      // if (sounds.vowels.includes(letter)) {
      //   infix = 'n';
      // }

      if (sounds.unvoicedConsonants.includes(letter)) {
        result = 't';
      } else {
        result = 'd';
      }

      if (sounds.frontVowels.includes(vowel)) {
        result += 'an';
      } else {
        result += 'en';
      }
      break;
    case Case.Locative:
      // if (sounds.vowels.includes(letter)) {
      //   infix = 'n';
      // }

      if (sounds.unvoicedConsonants.includes(letter)) {
        result = 't';
      } else {
        result = 'd';
      }

      if (sounds.frontVowels.includes(vowel)) {
        result += 'a';
      } else {
        result += 'e';
      }
      break;
    case Case.Instrumental:
      if (sounds.vowels.includes(letter)) {
        infix = 'y';
      }

      if (sounds.frontVowels.includes(vowel)) {
        result = 'la';
      } else {
        result = 'le';
      }
      break;
    case Case.Dative:
      if (sounds.vowels.includes(letter)) {
        infix = 'y';
      }

      if (sounds.frontVowels.includes(vowel)) {
        result = 'a';
      } else {
        result = 'e';
      }
      break;
  }

  return { infix, suffix: result, prefix: '' };
};

/** Returns the word base concatenated with the appropriate case suffix for a given base word and a case
 * Verilen kelimeye uygun hâl ekini ekler
 */
export const makeCase = (base: string, _case: Case, isProperNoun: boolean = false): string => {
  const affix = getCaseSuffix(base, _case);
  const suffix = affix.infix + affix.suffix;
  const punctuation = isProperNoun ? "'" : '';
  let word = _case === Case.Absolute ? base : alterToVoicedConsonant(base);
  const firstLetter = suffix[0];

  if (sounds.vowels.includes(firstLetter)) {
    word = alterToVowelDrop(word);
  }

  return word + punctuation + suffix;
};

/** Returns the question suffix for a given word -
 * Verilen kelimeye uygun soru ekini döndürür
 */
export const getQuestionSuffix = (base: string): Affix => {
  const { vowel } = util.getComponents(base);
  let result: string;

  if (sounds.frontVowels.includes(vowel)) {
    if (sounds.roundedVowels.includes(vowel)) {
      result = ' mu';
    } else {
      result = ' mı';
    }
  } else {
    if (sounds.roundedVowels.includes(vowel)) {
      result = ' mü';
    } else {
      result = ' mi';
    }
  }

  return { suffix: result, prefix: '', infix: '' };
};

/** Transforms a given word into interrogative form -
 * Verilen ismi soru haline getirir
 */
export const makeQuestion = (base: string): string => {
  return util.concat(base, getQuestionSuffix(base))
};

/** Returns the relative pronoun -
 * -ki ilgi zamirini döndürür
 */
export const getRelativePronoun = (): string => {
  return 'ki';
};

/** Concatenates given base with the relative pronoun -
 * Verilen kelimeyi ilgi zamiri ile birleştirir
 */
export const makeRelative = (base: string, pronoun: Pronoun, isProperNoun: boolean = false): string => {
  return makeComplete(base, isProperNoun) + getRelativePronoun();
};

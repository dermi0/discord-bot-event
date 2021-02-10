import { I18nInterface } from '@/interfaces/i18n.interface';

const enEN: I18nInterface = {
  system: {
    unknownError: {
      title: 'Unknown error',
      description: 'Unknown error, please contact an administrator',
    },
  },
  init: {
    create: {
      title: 'Initialization successful !',
      description: 'Thanks for initializing DBE !\n DBE will only analyse message on tis channel',
    },
    update: {
      title: 'DBE configuration updated',
      description: 'DBE configuration has been updated',
    },
    errors: {
      badLang: {
        title: 'Bad language',
        description: 'The given language isn\'nt currently supported, please use of the following:\n - frFR\n- enEN',
      },
    },
  },
  new: {
    errors: {
      badRegex: {
        title: 'Error in the command !',
        description: 'Error, the command is invalid.\n\nIs seems that the command is missing some elements.\nUse `@DBE help for the list a commands.',
      },
      past: {
        title: 'Invalid date',
        description: 'The event must be set in the future',
      },
    },
  },
  embed: {
    credits: ' | Developed by Falcort for the Svalinn Tactical Security Group',
    event: {
      description: '$$description$$ \n\n **Day**: $$day$$ \n **Time**: $$time$$ \n\n **Participants**:$$participants$$',
      noPeople: '\n- No participant',
    },
  },
};

export default enEN;

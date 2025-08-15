const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0';

const aboutMe = {
  title: 'About Me',
  paragraphs: [
    {
      body: `I'm a software engineer focused on the human computer interaction between
      people, and the applications they use day to day. At Yext I help build and maintain
      the applications that generate our pages. Together our service hosts millions of
      static pages receiving +5 billion views in a year (2021), chances are you've
      already visited one.`,
    },
  ],
};

const serverInfo = {
  title: 'Server Information',
  paragraphs: [
    {
      title: 'Site Purpose',
      body: `This site aims to be a source of truth for my internet presence. It keeps track of the sites I've been
      a part of, both for work and fun. It's also marked up as structured data for experimenting with indexing my
      personal profile.`,
    },
  ],
  bullets: [
    {
      label: 'Version',
      value: version,
    },
    {
      label: 'Domain',
      value: 'tristantimblin.dev',
    },
    {
      label: 'Host',
      value: 'Netlify',
    },
    {
      label: 'Creation',
      value: '2019-09-14T20:22:57Z',
    },
  ],
};

const personalInfo = {
  title: 'Structured Data',
  bullets: [
    {
      label: 'Name',
      value: 'Tristan Timblin',
      schema: 'name',
    },
    {
      label: 'Origin',
      value: 'Virginia, US',
      schema: 'homeLocation',
    },
    {
      label: 'Hobbies',
      value: ['Photography', 'Running', 'Drawing'],
      schema: 'knowsAbout',
    },
    {
      label: 'Alumni',
      value: 'Drexel University',
      schema: 'alumniOf',
    },
    {
      label: 'About',
      value: 'I love to create things and be outside, summer is by far my favorite season.',
    },
  ],
};

export default {
  aboutMe,
  serverInfo,
  personalInfo,
};

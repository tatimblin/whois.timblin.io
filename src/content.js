const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0';

const aboutMe = {
  title: 'About Me',
  paragraphs: [
    {
      body: `Tristan received his undergraduate in Interactive Digital Media from Drexel University in 2018 and has
      worked at software and automotive companies Cohere, Yext, Fisker, AWS, and eero since. Throughout his career
      Tristan has developed award-winning front-end experiences, open source software frameworks, high preformance
      IoT signal processing systems, and critical local and cloud network infrastructure.

      Tristan's creativity and interest in technology brings a breadth of experience to complex problems often leading
      to well constructed and or novel solutions across disparate domains.`,
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
      value: 'Github Pages',
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

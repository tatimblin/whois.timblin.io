const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0';

const aboutMe = {
  title: 'About Me',
  paragraphs: [
    {
      body: `Tristan earned his degree in Interactive Digital Media from Drexel University in 2018 and has since
      worked at Cohere, Yext, Fisker, AWS, and eero. His work spans high-performance IoT signal processing, data
      center-scale network infrastructure, open-source tools and frameworks, over-the-air updates, and award-winning
      front-end experiences.`,
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

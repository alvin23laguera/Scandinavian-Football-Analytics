import { leagueStandings } from './mockData';

const getBadge = (teamName) => {
    const team = leagueStandings.find(t => t.team.includes(teamName) || teamName.includes(t.team));
    return team ? team.badgeUrl : '';
};

export const topPerformers = {
  goals: [
    { name: "Jens Hjertø-Dahl", team: "Tromsø", value: 5, badge: getBadge("Tromsø") },
    { name: "Lars Olden Larsen", team: "Tromsø", value: 4, badge: getBadge("Tromsø") },
    { name: "Emil Breivik", team: "Molde", value: 3, badge: getBadge("Molde") },
    { name: "Niklas Fuglestad", team: "Viking", value: 3, badge: getBadge("Viking") },
    { name: "Thomas Lehne Olsen", team: "Lillestrøm", value: 3, badge: getBadge("Lillestrøm") },
  ],
  assists: [
    { name: "Zlatko Tripic", team: "Viking", value: 4, badge: getBadge("Viking") },
    { name: "Ruben Y. Jenssen", team: "Tromsø", value: 3, badge: getBadge("Tromsø") },
    { name: "Martin T. Vinjor", team: "KFUM Oslo", value: 3, badge: getBadge("KFUM Oslo") },
    { name: "David Edvardsson", team: "Tromsø", value: 2, badge: getBadge("Tromsø") },
    { name: "Magnus Wolff Eikrem", team: "Molde", value: 2, badge: getBadge("Molde") },
  ],
  cleanSheets: [
    { name: "Jakob Haugaard", team: "Tromsø", value: 3, badge: getBadge("Tromsø") },
    { name: "Oscar Hedvall", team: "Vålerenga", value: 2, badge: getBadge("Vålerenga") },
    { name: "Mamour N'diaye", team: "Sarpsborg 08", value: 2, badge: getBadge("Sarpsborg 08") },
    { name: "Arild Østbø", team: "Viking", value: 2, badge: getBadge("Viking") },
    { name: "Mads Hedenstad", team: "Lillestrøm", value: 2, badge: getBadge("Lillestrøm") },
  ],
  rating: [
    { name: "Jens Hjertø-Dahl", team: "Tromsø", value: 9.75, badge: getBadge("Tromsø") },
    { name: "Thomas L. Olsen", team: "Lillestrøm", value: 8.65, badge: getBadge("Lillestrøm") },
    { name: "Zlatko Tripic", team: "Viking", value: 8.58, badge: getBadge("Viking") },
    { name: "Ruben Y. Jenssen", team: "Tromsø", value: 8.42, badge: getBadge("Tromsø") },
    { name: "Promise Meliga", team: "Kristiansund", value: 8.31, badge: getBadge("Kristiansund") },
  ]
};

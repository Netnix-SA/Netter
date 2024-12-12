INSERT INTO Account {
	id: Account:sj9wrdj7q7z1da1apbuf,
	email: 'fvilla@netnix.net',
	passkeys: [
		{
			counter: 0,
			id: '10512c10-989c-11ef-af0d-f31450aad3a2',
			public_key: 'pQECAyYgASFYIISq3q_omgNwBmotp9Ap8WCyLmhCHFPSgHpwM0E7lnJoIlggkTqbfyq-L83Tl11QpzwmZEb-GQsW8oKMbFDEy802rMU',
			transports: []
		}
	],
	user: {
		id: User:yt2hrlb0mynjar8q5la5
	}
};

INSERT INTO User {
	id: User:yt2hrlb0mynjar8q5la5,
	handle: 'fvilla',
	email: 'fvilla@netnix.net',
	full_name: 'Facundo Villa',
	color: 'Green/Light',
};

INSERT INTO User {
	handle: 'lvilla',
	email: 'lvilla@netnix.net',
	full_name: 'Leonardo Villa',
	color: 'Orange/Light',
};

INSERT INTO User {
	handle: 'lsalerno',
	email: 'lsalerno@netnix.net',
	full_name: 'Lucca Salerno',
	color: 'Blue/Light',
};

INSERT INTO User {
	handle: 'marceci',
	email: 'marceci@netnix.net',
	full_name: 'Maximo Arceci',
	color: 'Purple/Light',
};

INSERT INTO Status {
	name: 'Backlog',
	state: 'Backlog',
	color: 'Gray/Light',
	icon: '📦',
	position: {
		i: 0,
	},
};

INSERT INTO Status {
	name: 'In Progress',
	state: 'Alive',
	color: 'Green/Light',
	icon: '🚀',
	position: {
		i: 1,
	},
};

INSERT INTO Status {
	name: 'Done',
	state: 'Done',
	color: 'Blue/Light',
	icon: '🎉',
	position: {
		i: 2,
	},
};

-- Component

INSERT INTO Component {
	id: Component:6ks39quoxtsqkbzg2m3j,
	description: 'Feature description',
	name: 'Main Booster Engine',
	type: 'Service'
};

INSERT INTO Component {
	description: 'Feature description',
	id: Component:fzkmaqoura9t1k0928js,
	name: 'Cofee Machine',
	type: 'Application'
};

-- Feature

INSERT INTO Feature {
	constraints: '',
	description: 'Replace old capacitor based reactors with flux based ones',
	id: Feature:d0d5h8myzdva617np7kg,
	name: 'Flux reactors',
	notes: 'Ask Jerbail where the teflon tape is',
	value: 'Medium'
};

INSERT INTO Feature {
	constraints: '',
	description: 'Feature description',
	id: Feature:udm3scbcxu6nlkuhqx5t,
	name: 'Cofee machine',
	notes: '',
	value: 'High'
};

INSERT INTO Feature {
	constraints: '',
	description: 'Develop and install the main engine, critical for giga-sonic travel.',
	id: Feature:ye01e5mwpxti5cyvg6xh,
	name: 'Main Propulsor Engine',
	notes: '',
	value: 'High'
};

-- Label

INSERT INTO Label {
	id: Label:05s25xapdbmdgux4xb5z,
	color: 'Red/Light',
	description: 'IDK',
	icon: '🚀',
	title: 'Engine'
};

INSERT INTO Label {
	id: Label:c0e5gph8jrtob4ucxa4i,
	color: 'Yellow/Light',
	description: 'IDK',
	icon: '⚡',
	title: 'Electrical'
};

INSERT INTO Label {
	id: Label:ngva3jco5f0dvmpyt709,
	color: 'Blue/Light',
	description: 'IDK',
	icon: '🔧',
	title: 'Mechanical'
};

INSERT INTO Label {
	id: Label:rwkwfwx8pvla09ursuug,
	color: 'Purple/Light',
	description: 'IDK',
	icon: '🫂',
	title: 'Comfort'
};

-- Project

INSERT INTO Project {
	id: Project:wahu8u1kvo8wtz12qfoe,
	created: d'2024-11-25T19:31:05.789Z',
	description: 'We hope to rebuild our TR-800 ship in time to save the Sander quadrant from the empire.',
	end: NULL,
	members: [],
	milestones: [
		{
			description: 'Milestone description',
			title: 'New milestone'
		},
	],
	name: 'TR-800 construction',
	status: Status:3ystm8dscgq83hp2l0r2,
	updates: []
};

-- Objective

INSERT INTO Objective {
	id: Objective:cgwksq8gou6k43hema2i,
	active: true,
	description: 'Objective description',
	end: NULL,
	title: 'Shoot down 1st Terrania Imperial Base'
};

INSERT INTO Objective {
	id: Objective:potkp2bfsvegan7ta5iq,
	active: true,
	description: 'Our first objective is to get the ship to fly to Huggart. If that goes well then we are ready for our critical missions.',
	end: NULL,
	title: 'Fly to Huggart'
};

-- Product

INSERT INTO Product {
	id: Product:icju45t4n31neo8ejl3s,
	applications: [],
	created: d'2024-09-13T22:53:04.474Z',
	description: "The TR-800 will be the rebel's latest ship. It's goal is to aide the resistance in their fight against the empire.",
	name: 'TR-800'
};

-- Task

INSERT INTO Task {
	id: Task:gwkelwmyj5pycoiftrek,
	body: 'Construct the main engine and install it in the ship',
	created: d'2024-12-06T03:39:45.102Z',
	effort: 'Week',
	labels: [
		Label:05s25xapdbmdgux4xb5z
	],
	priority: 'High',
	status: {
		id: Status:3ystm8dscgq83hp2l0r2
	},
	title: 'Build 1st protype',
	updates: [],
	value: 'High'
};

INSERT INTO Task {
	id: Task:q9jzreujqojouhmtpkrz,
	body: 'Buy(or steal) a new heating element for the coffee machine. Here it is [heating element](https://www.amazon.com/Bunn-01227-0000-Warmer-Element-120-volt/dp/B00HV0NF9A/ref=sr_1_1?crid=15NZFYIQYM2DL&dib=eyJ2IjoiMSJ9.0pG3TPyuYyUf4cLC0_hydg_PWtm4soD5ewMvu2vAgvdy0KcFqVRNY7Y_FLVHSXFaY_I1BzXyRSkCHJVb6tNCbdbuCjKnONJ1OOZDz-eUamlb6JJBZcQueN2bKhq1xWW6e-rggvQSBBxTdDMxnf-kLLo3cMQImckBnO4HkB5pzM1vK89O-PbEvpll7gODQ8ztVi0-C_7Z2JgcbnEmmkZ_KxSLm0uJwgY1p6I5I6rKetG5KTd5NmxUN-M2Fyxq49KjSimwCOz0BdUceWMXGuWByCawNZ3jK7cB0dpImXCXUa8.notNk-G2EW9tauPWJqILK2l2ieDq9mQfauxXFw_5hiA&dib_tag=se&keywords=coffee+machine+heating+element&qid=1733796862&sprefix=coffee+machine+heat%2Caps%2C328&sr=8-1)',
	created: d'2024-12-06T21:40:48.182Z',
	effort: 'Day',
	labels: [
		Label:rwkwfwx8pvla09ursuug
	],
	priority: 'Medium',
	status: {
		id: Status:3ystm8dscgq83hp2l0r2
	},
	title: 'Fix busted heating element',
	updates: [],
	value: 'Medium'
};

INSERT INTO Task {
	id: Task:vkceetbwxeuv9sm8lkiz,
	body: 'Steal some coffee filters from the Celestial Cafeteria',
	created: d'2024-12-05T16:12:49.206Z',
	effort: 'Day',
	labels: [
		Label:rwkwfwx8pvla09ursuug
	],
	priority: 'Low',
	status: {
		id: Status:3ystm8dscgq83hp2l0r2
	},
	title: 'Get coffee filters',
	updates: [],
	value: 'High'
};

INSERT INTO Task {
	id: Task:zin87ejq9qg368mwmyzl,
	body: '',
	created: d'2024-12-06T03:31:03.444Z',
	effort: 'Hours',
	labels: [
		Label:c0e5gph8jrtob4ucxa4i
	],
	priority: 'Urgent',
	status: {
		id: Status:3ystm8dscgq83hp2l0r2
	},
	title: 'Remove old wiring',
	updates: [],
	value: 'High'
};

INSERT INTO Task {
	id: Task:zm8mg83oyojv5arfc4q5,
	body: '',
	created: d'2024-12-03T20:31:34.451Z',
	effort: 'Days',
	labels: [
		Label:ngva3jco5f0dvmpyt709
	],
	priority: 'Low',
	status: {
		id: Status:3ystm8dscgq83hp2l0r2
	},
	title: 'Install plasma intake valves',
	updates: [],
	value: 'Low'
};

-- ToDo

INSERT INTO ToDo {
	id: ToDo:1mngi5335sdr8zzlbud4,
	done: d'2024-12-06T03:39:45.102Z',
	due: NULL,
	title: 'Ask Goob about the cristal plasma injectors',
};

INSERT INTO ToDo {
	id: ToDo:2mngi5335sdr8zzlbud4,
	done: NULL,
	due: NULL,
	title: "Ask Mitcha if he's seen the adjustable pliers",
};

INSERT INTO ToDo {
	id: ToDo:3mngi5335sdr8zzlbud4,
	done: NULL,
	due: d'2024-12-06T04:39:45.102Z',
	title: "Look for toilet bowls",
};

-- Transaction

INSERT INTO Transaction {
	action: 'CREATE',
	class: 'Task',
	id: Transaction:cq0r4hg7ca83u9neaye4,
	oid: Task:vkceetbwxeuv9sm8lkiz,
	path: NULL,
	timestamp: d'2024-12-05T16:12:49.211Z',
	user: User:yt2hrlb0mynjar8q5la5,
};

-- needs

INSERT INTO needs {
	id: needs:4nzcpoyi7knqff3598d0,
	in: Feature:ye01e5mwpxti5cyvg6xh,
	out: Component:6ks39quoxtsqkbzg2m3j
};

INSERT INTO needs {
	id: needs:7d8e60ebhxv07u5p9lq5,
	in: Feature:udm3scbcxu6nlkuhqx5t,
	out: Component:fzkmaqoura9t1k0928js
};

INSERT INTO needs {
	id: needs:gxe7b9uo7vxds7lpfbgp,
	in: Product:icju45t4n31neo8ejl3s,
	out: Component:6ks39quoxtsqkbzg2m3j
};

INSERT INTO needs {
	id: needs:yx854jd6mt1fm05ckt9o,
	in: Product:icju45t4n31neo8ejl3s,
	out: Component:fzkmaqoura9t1k0928js
};

-- pins

INSERT INTO pins {
	id: pins:9sv936nmzj8kzwhgiyvx,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Project:wahu8u1kvo8wtz12qfoe
};

INSERT INTO pins {
	id: pins:rdfjh7w7ft0fdurlg6ys,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Product:icju45t4n31neo8ejl3s
};

INSERT INTO pins {
	id: pins:vvyorjmxki1bea7ftfn8,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Feature:udm3scbcxu6nlkuhqx5t
};

-- slated

INSERT INTO slated {
	id: slated:27yg9j9iuxc1x80hib5u,
	in: Feature:d0d5h8myzdva617np7kg,
	out: Objective:potkp2bfsvegan7ta5iq
};

INSERT INTO slated {
	id: slated:76ebo6bhajikdgl9coo1,
	in: Feature:ye01e5mwpxti5cyvg6xh,
	out: Objective:potkp2bfsvegan7ta5iq
};

INSERT INTO slated {
	id: slated:iccrszyg0dnz0rjeoaa6,
	in: Feature:udm3scbcxu6nlkuhqx5t,
	out: Objective:potkp2bfsvegan7ta5iq
};

-- tackles

INSERT INTO tackles {
	id: tackles:4wrw0xyu3bxnu0wfum04,
	in: Task:vkceetbwxeuv9sm8lkiz,
	out: Feature:udm3scbcxu6nlkuhqx5t
};

INSERT INTO tackles {
	id: tackles:8d1701dwfj5qp9l6xkrr,
	in: Task:q9jzreujqojouhmtpkrz,
	out: Feature:udm3scbcxu6nlkuhqx5t
};

INSERT INTO tackles {
	id: tackles:9tklup9cqezn5g987gn5,
	in: Task:zm8mg83oyojv5arfc4q5,
	out: Feature:d0d5h8myzdva617np7kg
};

INSERT INTO tackles {
	id: tackles:c1iwye32wjxgddj1jw8h,
	in: Task:gwkelwmyj5pycoiftrek,
	out: Feature:ye01e5mwpxti5cyvg6xh
};

INSERT INTO tackles {
	id: tackles:wpkli06o6qqf5h0jw723,
	in: Task:zin87ejq9qg368mwmyzl,
	out: Feature:d0d5h8myzdva617np7kg
};

-- has

INSERT INTO has {
	id: has:0rmn6hhiha67ixvq2umy,
	in: User:yt2hrlb0mynjar8q5la5,
	out: ToDo:1mngi5335sdr8zzlbud4
};

-- features

RELATE Product:icju45t4n31neo8ejl3s->features->Feature:d0d5h8myzdva617np7kg;
RELATE Product:icju45t4n31neo8ejl3s->features->Feature:udm3scbcxu6nlkuhqx5t;
RELATE Product:icju45t4n31neo8ejl3s->features->Feature:ye01e5mwpxti5cyvg6xh;

-- schedules

INSERT INTO schedules {
	id: schedules:0x7j7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Objective:potkp2bfsvegan7ta5iq
};

INSERT INTO schedules {
	id: schedules:1x7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Objective:cgwksq8gou6k43hema2i
};

-- belongs

INSERT INTO belongs {
	id: belongs:0x7j7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Task:gwkelwmyj5pycoiftrek,
};

INSERT INTO belongs {
	id: belongs:1x7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Task:q9jzreujqojouhmtpkrz,
};

INSERT INTO belongs {
	id: belongs:2x7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Task:vkceetbwxeuv9sm8lkiz,
};

INSERT INTO belongs {
	id: belongs:3x7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Task:zin87ejq9qg368mwmyzl,
};

INSERT INTO belongs {
	id: belongs:4x7j7j7j7j7j7j7j7j7,
	in: Project:wahu8u1kvo8wtz12qfoe,
	out: Task:zm8mg83oyojv5arfc4q5,
};

-- assigned

INSERT INTO assigned {
	id: assigned:0x7j7j7j7j7j7j7j7j7j7,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Task:q9jzreujqojouhmtpkrz
};

INSERT INTO assigned {
	id: assigned:1x7j7j7j7j7j7j7j7j7,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Task:vkceetbwxeuv9sm8lkiz
};

INSERT INTO assigned {
	id: assigned:2x7j7j7j7j7j7j7j7j7,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Task:zin87ejq9qg368mwmyzl
};

INSERT INTO assigned {
	id: assigned:3x7j7j7j7j7j7j7j7j7,
	in: User:yt2hrlb0mynjar8q5la5,
	out: Task:zm8mg83oyojv5arfc4q5
};

-- regards

INSERT INTO regards {
	id: regards:0x7j7j7j7j7j7j7j7j7j7,
	in: ToDo:1mngi5335sdr8zzlbud4,
	out: Task:zm8mg83oyojv5arfc4q5,
};
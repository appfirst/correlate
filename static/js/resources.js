define(['utils'], function() {

	var Resources = {
		servers: {
			name: 'servers',
			title: 'Servers',
			title_singular: 'Server',
			url: '/api/servers/',
			
			parser: function(data) {
				if (data[0] && data[0].disk_busy) {
					var disk_busys = data[0].disk_busy;
					_(disk_busys).each(function(value, key) {
						_(data).each(function(d) {
							d['disk_busy_'+key] = value
						});					
					});
				}
				return data;
			},
			
			extra_metrics: function(data) {
				var extra_metrics = []
				
				var disk_busys = data[0].disk_busy;
				_(disk_busys).each(function(value, key) {
					extra_metrics.push({
						'name': 'Disk Busy (' + key + ')',
						'unit': 'percent',
						'value': 'disk_busy_' + key,
						'order': 1.5
					});
				});			
				
				var disk_usages = data[0].disk_percent_part;
				_(disk_usages).each(function(value, key) {
					extra_metrics.push({
						'name': 'Disk Usage (' + key + ')',
						'unit': 'percent',
						'value': 'diskp_part_' + key,
						'order': 2.5
					});
				});

				return extra_metrics;
			},

			additional_info: function(model) {
				var os_detail = model.get('os_detail').split(" ")[0];
				var ip = model.get('location_ip');
				var running = model.get('running') ? 'Running' : 'Not Running';
				return os_detail + ' | ' + running + ' | ' + ip
			},	
			detailTabs: [
				{
					name:'processes',
					url: '/api/servers/<%=id%>/processes/data/',
					parse: function(data, resource, clicked_time) {
						_.each(data.data, function(d){
							d.clicked_time = clicked_time
						});
						return data.data
					}
				},
				{
					name: 'alerts',
					url: '/api/servers/<%=id%>/alert_histories/',
					parse: function(data) {
						return data.data
					}
				},
				{
					name: 'strf', //sockets threads files registries
					url: '/api/servers/<%=id%>/processes/detail/',
					parse: function(data) {
						return {
							'sockets': data.data.sockets || [],
							'threads': data.data.threads || [],
							'files': data.data.files && _.reduce(data.data.files, function(list, files, uid){
								_.each(files, function(f) {
									list.push({name: f});
								});
								return list;
							}, []),
							'registries': data.data.registries && data.data.registries.map(function(r) {return {name: r}}),
						}
					}
				}					
			],
			resourcePrefix: 's',
			metrics: [
				{
					name:'CPU',
					unit:"percent",
					value:'cpu',
					order: 0
				},
				{
					name:'Memory',
					unit:"bytes",
					value:'memory',
					order: 3
				},
				{
					name:'Average Response Time',
					unit:"microseconds",
					value:'avg_response_time',
					order: 6
				},
				{
					name:'Disk Busy (Max)',
					unit:"percent",
					value:'disk_busy_max',
					order: 1
				},
				{
					name:'Disk Usage (Max)',
					unit:"percent",
					value:'diskp_max',
					order: 2
				},
				{
					name: 'Major Page Faults',
					unit: '',
					value: 'page_faults',
					order: 4
				},
				{
					name: 'Processes',
					unit: '',
					value: 'process_num',
					order: 5
				},
				{
					name: 'Stolen Time',
					unit: 'microseconds',
					value: 's_time',
					order: 7
				},
				{
					name: 'Outbound Network Traffic',
					unit: 'bytes',
					value: 'socket_write',
					order: 9
				},
				{
					name: 'Inbound Network Traffic',
					unit: 'bytes',
					value: 'socket_read',
					order: 8
				},						
				{
					name: 'Threads',
					unit: '',
					value: 'thread_num',
					order: 10
				}
			]
		},
		process_groups: {
			name: 'process_groups',
			title: 'Process Groups',
			title_singular: 'Process Group',
			url: '/api/applications/',
			
			additional_info: function(model) {
				var num_servers = model.get('servers').length;
				var s = num_servers == 1 ? '' : 's'
				return  num_servers + ' server' + s;
			},

			resourcePrefix: 'a',
			metrics: [
				{
					name: 'Threads',
					unit: '',
					value: 'thread_num',
					order: 16
				},
				{
					name: 'Network Connections',
					unit: '',
					value: 'socket_num',
					order: 11
				},
				{
					name: 'Major Page Faults',
					unit: '',
					value: 'page_faults',
					order: 6
				},
				{
					name: 'Outbound Network Traffic',
					unit: 'bytes',
					value: 'socket_write',
					order: 13
				},
				{
					name: 'Inbound Network Traffic',
					unit: 'bytes',
					value: 'socket_read',
					order: 12
				},
				{
					name: 'Memory',
					unit: 'bytes',
					value: 'memory',
					order: 5
				},
				{
					name: 'File Read',
					unit: 'bytes',
					value: 'file_read',
					order: 3
				},
				{
					name: 'Average Response Time',
					unit: 'microseconds',
					value: 'avg_response_time',
					order: 8
				},
				{
					name: 'Registries',
					unit: '',
					value: 'registry_num',
					order: 10
				},
				{
					name: 'Average Transaction Count',
					unit: '',
					value: 'net_transact_num',
					order: 14
				},
				{
					name: 'File Write',
					unit: 'bytes',
					value: 'file_write',
					order: 4
				},
				{
					name: 'Processes',
					unit: '',
					value: 'process_num',
					order: 7
				},
				{
					name: 'Files',
					unit: '',
					value: 'file_num',
					order: 2
				},
				{
					name: 'Socket Responses',
					unit: '',
					value: 'response_num',
					order: 9
				},
				{
					name: 'CPU',
					unit: 'percent',
					value: 'cpu',
					order: 0
				}
				// missing:
				// critical incident reports 1
				// incident reports 14
			],
			detailTabs: [
				{
					name:'processes',
					url: '/api/applications/<%=id%>/processes/data/',
					parse: function(data, resource, clicked_time) {
						_.each(data.data, function(d){
							d.clicked_time = clicked_time
						});
						return data.data
					}
				},
				{
					name: 'alerts',
					url: '/api/applications/<%=id%>/alert_histories/',
					parse: function(data) {
						return data.data
					}
				},
				{
					name: 'strf', //sockets threads files registries
					url: '/api/applications/<%=id%>/detail/',
					parse: function(data) {
						return {
							'sockets': data.data.sockets || [],
							'threads': data.data.threads || [],
							'files': data.data.files && data.data.files.map(function(f) {return {name: f}}),
							'registries': data.data.registries && data.data.registries.map(function(r) {return {name: r}}),
						}
					}
				}	
			],		
		},
		polled_data: {
			name: 'polled_data',
			title: 'Polled Data',
			title_singular: 'Polled Data',
			url: '/api/polled_data/',
			resourcePrefix: 'n',
			parser: function(data) {
				if (data[0] && data[0].values) {
					var values = data[0].values;
					_(values).each(function(value, key) {
						_(data).each(function(d) {
							try {
								d[value[0]] = d.values[value[0]][1].val
							} catch(error) {
								d[value[0]] = null
							}
						});					
					});
				}

				// convert status text to numerical values
				_(data).each(function(d) {
					var dict = {'OK':0,'WARNING':1,'CRITICAL':2}
					d.status = dict[d.status]
				});
				return data;
			},
			additional_info: function(model) {
				return model.get('server_nickname');
			},		
			extra_metrics: function(data) {
				var extra_metrics = [];

				var values = data[0].values;
				_(values).each(function(val, key) {
					extra_metrics.push({
						'name': key,
						'unit': '',
						'value': key,
						'order': 1
					});
				});

				return extra_metrics;
			},
			detailTabs: [
				{
					name:'polled_data',
					url: '/api/polled_data/<%=id%>/data/',
					parse: function(data, resource) {
						_.each(data.data, function(d) {
							d.resource_name = resource.get('name') + ' (' + resource.get('server_nickname') + ')';
						})
						return data.data
					}
				},
				{
					name: 'alerts',
					url: '/api/polled_data/<%=id%>/alert_histories/',
					parse: function(data) {
						return data.data
					}
				}
			],		
			metrics: [
				{
					name: 'status',
					unit: 'status',
					value: 'status',
					order: 0
				}
			]
		},
		processes: {
			name: 'processes',
			title: 'Processes',
			title_singular: 'Process',
			url: '/api/processes/',
			resourcePrefix: 'p',
			metrics: [
				{
					name: 'CPU',
					unit: 'percent',
					value: 'cpu',
					order: 0
				},
				{
					name: 'Average Response Time',
					unit: 'microseconds',
					value: 'avg_response_time',
					order: 1
				},			
				{
					name: 'Files',
					unit: '',
					value: 'file_num',
					order: 2
				},
				{
					name: 'File Read',
					unit: 'bytes',
					value: 'file_read',
					order: 3
				},
				{
					name: 'File Write',
					unit: 'bytes',
					value: 'file_write',
					order: 4
				},
				{
					name: 'Flags',
					unit: '',
					value: 'flags',
					order: 99
				},
				{
					name: 'Memory',
					unit: 'bytes',
					value: 'memory',
					order: 5
				},
				{
					name: 'Major Page Faults',
					unit: '',
					value: 'page_faults',
					order: 6
				},
				{
					name: 'Net Transaction Count',
					unit: '',
					value: 'net_transact_num',
					order: 7
				},				
				{
					name: 'Registries',
					unit: '',
					value: 'registry_num',
					order: 9
				},
				{
					name: 'Socket Responses',
					unit: '',
					value: 'response_num',
					order: 8
				},
				{
					name: 'Network Connections',
					unit: '',
					value: 'socket_num',
					order: 10
				},
				{
					name: 'Inbound Network Traffic',
					unit: 'bytes',
					value: 'socket_read',
					order: 11
				},
				{
					name: 'Outbound Network Traffic',
					unit: 'bytes',
					value: 'socket_write',
					order: 12
				},
				{
					name: 'Threads',
					unit: '',
					value: 'thread_num',
					order: 14
				}
				// missing: avg. resp time, incident reports, avg transaction count
			],
			detailTabs: [
				/* //API doesn't yet support alert histories for processes
				{
					name: 'alerts',
					url: '/api/processes/<%=uid%>/alert_histories/',
					parse: function(data) {
						return data.data
					}
				},
				*/
				{
					name: 'strf', //sockets threads files registries
					url: '/api/processes/<%=uid%>/detail/',
					parse: function(data) {
						return {
							'sockets': data.data.sockets || [],
							'threads': data.data.threads || [],
							'files': data.data.files && data.data.files.map(function(f) {return {name: f}}),
							'registries': data.data.registries && data.data.registries.map(function(r) {return {name: r}}),
						}
					}
				}	
			],
			additional_info: function(model) {
				return model.get('server_nickname') || model.get('resource_name');
			},			
		},	
		logs: {
			name: 'logs',
			title: 'Logs',
			title_singular: 'Log',
			url: '/api/logs/',
			resourcePrefix: 'l',
			metrics: [
				{
					name: 'num_info',
					unit: '',
					value: 'info',
					order: 0
				},
				{
					name: 'num_warning',
					unit: '',
					value: 'warning',
					order: 1
				},
				{
					name: 'num_critical',
					unit: '',
					value: 'critical',
					order: 2
				},				
			],
			detailTabs: [
				{
					name: 'alerts',
					url: '/api/logs/<%=id%>/alert_histories/',
					parse: function(data) {
						return data.data
					}
				},		
				{
					name: 'logs',
					url: '/api/logs/<%=id%>/detail/',
					parse: function(data) {
						return data.data
					}
				}
			],
			additional_info: function(model) {
				var source_type = model.get('source_type');
				var server = model.get('server_nickname');
				return server + ' | Type: ' + source_type
			},
			extra_metrics: function(data) {
				var extra_metrics = _.chain(data)
					.reduce(function(memo, item){memo = _.extend(memo, item); return memo}, {})
					.keys()
					.without('info', 'warning', 'critical', 'time')
					.map(function(m, i){return {name: m, unit: '', value: m, order: i+3} })
					.value();

				return extra_metrics;
			}		
		},
		buckets: {
			name: 'buckets',
			title: 'StatsD Buckets',
			title_singular: 'StatsD Bucket',
			url: '/api/buckets/',
			resourcePrefix: 'b',
			additional_info: function(model) {
				return model.get('type');
			},		
			metrics: [
				{
					name: 'value',
					unit: '',
					value: 'value',
					order: 0
				}
			],
			detailTabs: [
				{
					name: 'alerts',
					url: '/api/buckets/<%=id%>/alert_histories/',
					parse: function(data) {
						return data.data
					}
				},
			]
		}
	}

	return Resources;

});
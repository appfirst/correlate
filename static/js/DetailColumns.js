(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backgrid'], function (Backgrid) {
            return (root.DetailColumns = factory(Backgrid));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('Backgrid'));
    } else {
        // Browser globals
        root.DetailColumns = factory(root.Backgrid);
    }
}(this, function (Backgrid) {

    var sortByAttribute = function(model, sortKey) {
        return model.has(sortKey) ? model.get(sortKey) : -Infinity;
    }

    var sortByNumber = function(model, sortKey) {
        return parseFloat(model.get(sortKey))
    }    

    var DetailColumns = {
        polled_data: [
            {
                name:'resource_name',
                label:'name',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                label:'time',
                editable: false,
                sortType: 'toggle',
                cell: Backgrid.Cell.extend({
                    render: function() {
                        this.$el.html(moment.unix(this.model.get('time')).format('MM/D HH:mm'));
                        return this;
                    }
                })
            },
            {
                name:'text',
                label:'message',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            }
        ],
        registries: [
            {
                name:'name',
                label:'name',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },  
            ],
            files: [
            {
                name:'name',
                label:'name',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                name:'server',
                label:'server',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            }
        ],
        threads: [
            {
                name:'TID',
                label:'TID',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: 'string'
            },
            {
                name:'StackSize',
                label:'StackSize',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: 'string'
            },
            {
                name:'CreateTime',
                label:'CreateTime',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: Backgrid.Cell.extend({
                    render: function() {
                        var linux_epoch = windowsEpochToLinuxEpoch(this.model.get('CreateTime'));
                        this.$el.html(moment.unix(linux_epoch).format('MM/D HH:mm:ss.SSS'));
                        return this;                        
                    }
                })
            },
            {
                name:'KernelTime',
                label:'KernelTime',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: 'string'
            },
            {
                name:'UserTime',
                label:'UserTime',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: 'string'
            },
            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
        ],
        sockets: [
            {
                name: 'Status',
                label: 'Status',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                name: 'Type',
                label: 'Type',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },      
            {
                name: 'Socket',
                label: 'Socket',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },  
            {
                name: 'SockIP',
                label: 'Socket IP',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },  
            {
                name: 'SockPort',
                label: 'Socket Port',
                editable: false,
                sortType: 'toggle',
                cell: 'string',
                sortValue: sortByNumber
            },                  
            {
                name: 'PeerIP',
                label: 'Peer IP',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                name: 'PeerPort',
                label: 'Peer Port',
                editable: false,
                sortType: 'toggle',
                cell: 'string',
                sortValue: sortByNumber
            },  
            {
                name: 'TransactTime',
                label: 'Time Open',
                editable: false,
                sortType: 'toggle',
                cell: Backgrid.Cell.extend({
                    render: function() {
                        this.$el.html('<span class="list-popover" data-placement="right" data-content="opened: ' +
                            moment.unix(parseFloat(this.model.get('TransAcceptTime'))).format('MM/D HH:mm:ss') +'">'+
                            parseInt(this.model.get('TransactTime')) + "s"+'</span>');
                        return this;
                    }
                }),
                sortValue: sortByNumber
            },
            {
                name: 'TransSent',
                label: 'Bytes Sent',
                editable: false,
                sortType: 'toggle',
                cell: Backgrid.Cell.extend({
                    render: function() {
                        if (this.model.has('NumResponses')) {
                            var abs = parseInt(this.model.get('TransSent')) / (parseInt(this.model.get('NumResponses')) || 1);
                            this.$el.html('<span class="list-popover" data-placement="right" data-content="Avg. Bytes Sent: '+abs+'">'+this.model.get('TransSent') +'</span>')
                        } else {
                            this.$el.html(parseInt(this.model.get('TransSent')));                       
                        }
                        return this;
                    }
                }),
                sortValue: sortByNumber
            },
            {
                name: 'TransRecv',
                label: 'Bytes Received',
                editable: false,
                sortType: 'toggle',
                cell: Backgrid.Cell.extend({
                    render: function() {
                        if (this.model.has('NumResponses')) {
                            var abs = parseInt(this.model.get('TransRecv')) / (parseInt(this.model.get('NumResponses')) || 1);
                            this.$el.html('<span class="list-popover" data-placement="right" data-content="Avg. Bytes Received: '+abs+'">'+this.model.get('TransRecv') +'</span>')
                        } else {
                            this.$el.html(parseInt(this.model.get('TransRecv')));                       
                        }
                        return this;
                    }
                }),
                sortValue: sortByNumber
            },      
            {
                name: 'NumResponses',
                label: 'Num Responses',
                editable: false,
                sortType: 'toggle',
                sortValue: function(d) {
                    return d.get('Socket') == 'Client' ? -1 : d.get('NumResponses');
                },
                cell: Backgrid.Cell.extend({
                    render: function() {
                        if (this.model.get('Socket') == 'Client') {
                            this.$el.html('<span class="list-popover" data-placement="right"\
                                data-content="Client sockets don\'t have a num responses value"> &mdash; </span>');
                        } else {
                            this.$el.html(this.model.get('NumResponses'));
                        }
                        return this;
                    }
                })
            },
            {
                name: 'TotalResponseTime',
                label: 'Total Resp. Time',
                editable: false,
                sortType: 'toggle',
                sortValue: function(d) {
                    return d.get('Socket') == 'Client' ? -1 : d.get('TotalResponseTime');
                },                
                cell: Backgrid.Cell.extend({
                    render: function() {
                        if (this.model.get('Socket') == 'Client') {
                            this.$el.html('<span class="list-popover" data-placement="right"\
                                data-content="Client sockets don\'t have response times"> &mdash; </span>');
                        }
                        else if (!this.model.has('TotalResponseTime')) return this;
                        else if (this.model.has('NumResponses')) {
                            var art = parseInt(parseInt(this.model.get('TotalResponseTime')) / parseInt(this.model.get('NumResponses'))) + ' μs';
                            this.$el.html('<span class="list-popover" data-placement="right" data-content="Avg. Response Time: '+art+'">'+formatVal(this.model.get('TotalResponseTime'), 'microseconds') +'</span>')
                        } else {
                            this.$el.html(formatVal(this.model.get('TotalResponseTime'), 'microseconds') || ' - ');
                        }
                        return this;
                    }
                }),
            },      
            {
                name: 'ThreadId',
                label: 'Thread ID',
                editable: false,
                sortType: 'toggle',
                cell: 'string',
                sortValue: sortByNumber
            },      
            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },  
        ],
        processes: [
            {
                name: "name",
                label: "Name",
                editable: false,
                sortType: "toggle",
                sortValue: function(a, b) {return a.get(b).toLowerCase()},
                cell: Backgrid.StringCell.extend({
                    className: 'proc-name',
                    render: function () {
                        var name = '<a class="name theme-color">'+this.model.get('name')+'</a>'
                        var args = '&nbsp;<em>'+this.model.get('args')+'</em>';
                        this.$el.html(name + args);

                        return this;
                    },
                }), 
            },           
            {
                label: "PID",
                name: "pid",
                editable: false,
                sortType: "toggle",
                sortValue: function(a) {return -parseInt(a.get('uid').split('_')[1])},      
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Process Id">'+
                            'PID<b class="sort-caret"></b></a>');
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function() {
                        this.$el.html(this.model.get('uid').split('_')[1]);
                        return this;
                    }
                }), 
            },
            {
                label: "RT",
                editable: false,
                sortType: "toggle", 
                sortValue: function(a) {return -parseInt(a.get('uid').split('_')[2])},
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Running Time">'+
                            'RT<b class="sort-caret"></b></a>');
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.empty();
                        
                        var windows_epoch = this.model.get('uid').split('_')[2];
                        var linux_epoch = windowsEpochToLinuxEpoch(windows_epoch);
                        
                        var clickedTime = this.model.get('clicked_time') ? moment.unix(this.model.get('clicked_time')) : moment();
                        clickedTime = clickedTime.endOf('minute');
                        var displayingContent = moment(linux_epoch * 1000).from(clickedTime, true);
                        if (linux_epoch > clickedTime) {
                            displayingContent = 'seconds ago';
                        }

                        var popOver =  "Created: "  + moment.unix(linux_epoch).format('MM/D HH:mm:ss');
                        
                        var html = '<span class="list-popover" data-placement="right" data-content="' + popOver + '">' + displayingContent + '</span>';
                        this.$el.html(html);
                        this.delegateEvents();
                        return this;
                    }
                }), 
            },
            {
                name: "cpu",
                label: "CPU",
                editable: false,
                sortType: "toggle", 
                sortValue: sortByAttribute,
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('cpu'), 'cpu') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "avg_response_time",
                label: "ART",
                editable: false,
                sortType: "toggle",     
                sortValue: sortByAttribute,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Average Response Time">ART<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('avg_response_time'), 'microseconds') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "response_num",
                label: "SR",
                editable: false,        
                sortType: "toggle",
                sortValue: sortByAttribute,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Socket Responses">SR<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('response_num'), 'response_num') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "file_num",
                label: "Files",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('file_num'), 'file_num') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "file_read",
                label: "FR",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="File Read">FR<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('file_read'), 'file_read') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "file_write",
                label: "FW",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="File Write">FW<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('file_write'), 'file_write') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "memory",
                label: "Mem",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Memory">Mem<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('memory'), 'memory') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "registry_num",
                label: "Regs",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Registries">Regs<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('registry_num'), 'registry_num') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "socket_num",
                label: "Net",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Network Connections">Net<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('socket_num'), 'socket_num') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "socket_read",
                label: "In",
                sortType: "toggle",
                sortValue: sortByAttribute,
                editable: false,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Inbound Network Traffic">In<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('socket_read'), 'socket_read') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "socket_write",
                label: "Out",
                editable: false,
                sortType: "toggle",
                sortValue: sortByAttribute,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Outbound Network Traffic">Out<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('socket_write'), 'socket_write') || ' - ');
                        return this;
                    }
                }), 
            },
            {
                name: "thread_num",
                label: "Threads",
                editable: false,
                sortType: "toggle",
                sortValue: sortByAttribute,
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('thread_num'), 'thread_num') || ' - ');
                        return this;
                    }
                }), 
            },
            // {
            //  name: "tavg",
            //  label: "TAVG",
            //  editable: false,
            //  sortType: "toggle",
            //  headerCell: Backgrid.HeaderCell.extend({
            //      render: function () {
            //          this.$el.empty();
            //          this.$el.html('<a class="list-popover" data-placement="top" data-content="Average Transaction Count">TAVG<b class="sort-caret"></b></a>');
            //          this.delegateEvents();
            //          return this;
            //      }
            //  }),
            //  cell: Backgrid.StringCell.extend({
            //      render: function () {
            //          this.$el.empty();
            //          data = convert_units(this.model.attributes.tavg, "", true);
            //          this.$el.html(data);
            //          this.delegateEvents();
            //          return this;
            //      }
            //  }), 
            // },
            {
                name: "page_faults",
                label: "PF",
                editable: false,
                sortType: "toggle",
                sortValue: sortByAttribute,
                headerCell: Backgrid.HeaderCell.extend({
                    render: function () {
                        this.$el.empty();
                        this.$el.html('<a class="list-popover" data-placement="top" data-content="Major Page Faults">PF<b class="sort-caret"></b></a>');
                        this.delegateEvents();
                        return this;
                    }
                }),
                cell: Backgrid.StringCell.extend({
                    render: function () {
                        this.$el.html(formatVal(this.model.get('page_faults'), 'page_faults') || ' - ');
                        return this;
                    }
                }), 
            },
            // {
            //  name: "tlog",
            //  label: "IR",
            //  editable: false,
            //  sortType: "toggle",
            //  headerCell: Backgrid.HeaderCell.extend({
            //      render: function () {
            //          this.$el.empty();
            //          this.$el.html('<a class="list-popover" data-placement="top" data-content="Incident Reports">IR<b class="sort-caret"></b></a>');
            //          this.delegateEvents();
            //          return this;
            //      }
            //  }),
            //  cell: Backgrid.StringCell.extend({
            //      render: function () {
            //          this.$el.empty();
            //          data = convert_units(this.model.attributes.tlog, "", true);
            //          this.$el.html(data);
            //          this.delegateEvents();
            //          return this;
            //      }
            //  }), 
            // },
            // {
            //  name: "elog",
            //  label: "CIR",
            //  editable: false,
            //  sortType: "toggle",
            //  headerCell: Backgrid.HeaderCell.extend({
            //      render: function () {
            //          this.$el.empty();
            //          this.$el.html('<a class="list-popover" data-placement="top" data-content="Critical Incident Reports">CIR<b class="sort-caret"></b></a>');
            //          this.delegateEvents();
            //          return this;
            //      }
            //  }),
            //  cell: Backgrid.StringCell.extend({
            //      render: function () {
            //          this.$el.empty();
            //          data = convert_units(this.model.attributes.elog, "", true);
            //          this.$el.html(data);
            //          this.delegateEvents();
            //          return this;
            //      }
            //  }), 
            // },
            {
                label: "From",
                editable: false,
                sortType: 'toggle',
                cell: Backgrid.Cell.extend({
                    render: function() {
                        if (this.model.has('server_nickname')) {
                            var text = this.model.get('server_nickname');
                            text += this.model.has('resource_name') ? ' ('+this.model.get('resource_name')+')' : '';
                        } else {
                            var text = this.model.has('resource_name') ? this.model.get('resource_name') : '';
                        }
                        this.$el.html(text);
                        return this;
                    }
                })
            },      
            /* //not really needed, but here if want to add in the future
            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            */  
        ],
        files: [
            {
                name: 'name',
                label: 'Name',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },      
        ],
        logs: [
            {
                name: 'data',
                label: 'Log Message',
                editable: false,
                sortType: 'toggle',
                cell: Backgrid.Cell.extend({
                    className: 'multi-line',
                    render: function() {
                        this.$el.html(this.model.escape('data'));
                        return this;
                    }
                })
            },
            {
                name: 'severity',
                label: 'Severity',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },

            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },      
        ],
        alerts: [
            {
                name: 'trigger',
                label: 'Incident',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },
            {
                name: 'start',
                label: 'Started',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: Backgrid.Cell.extend({
                    render: function() {
                        this.$el.html( moment.unix(this.model.get('start')).format('MM/D HH:mm') );
                        return this;
                    }
                })
            },
            {
                name: 'end',
                label: 'Ended',
                editable: false,
                sortType: 'toggle',
                sortValue: sortByAttribute,
                cell: Backgrid.Cell.extend({            
                    render: function() {
                        if (this.model.get('end') === null) {
                            this.$el.html('Still in incident');
                        } else {
                            this.$el.html( moment.unix(this.model.get('end')).format('MM/D HH:mm') );
                        }
                        return this;
                    }
                })
            },
            {
                name:'resource_name',
                label:'From',
                editable: false,
                sortType: 'toggle',
                cell: 'string'
            },      
        ]
    }
    return DetailColumns;
}));
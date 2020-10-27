import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Appbar from './Appbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import ServerIcon from '../img/servers-logo.png';
import BlockIcon from '@material-ui/icons/Block';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Pagination from '@material-ui/lab/Pagination';
import { CssBaseline, Typography, CircularProgress } from '@material-ui/core';
import { Avatar, Button, Card, CardHeader, CardActions, CardContent, Collapse } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main: {
        whiteSpace: "pre-wrap",
        fontSize: 20
    },
    server: {
        width: theme.spacing(8)
    },
    server_card: {
        width: theme.spacing(40),
    },
    divider: {
        marginTop: theme.spacing(20)
    },
    status_box: {
        display: 'flex',
        fontSize: theme.spacing(3),
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    }
}));

function Home() {
    const token = Cookies.get('token');
    const [zone_reports, setReport] = useState([]);
    const [curr_zone, setCurrZone] = useState();
    const [details, setDetails] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const isAuthenticated = token != null ? true : false;
    const classes = useStyles();
    const theme = useTheme();
    let zone_id = 0;

    useEffect(() => {
        const result = axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => {
            console.log(res);
            setReport(res.data.zones);
            Cookies.set('zone_name', res.data.zones[0]['icat_server']['service_account_environment']['irods_zone_name'])
        })
    }, [isAuthenticated]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    const viewDetails = event => {
        setCurrZone(zone_reports[document.getElementsByClassName(classes.server_card)[0].id]['icat_server']);
        console.log(curr_zone);
        setDetails(true);
    }

    const closeDetails = event => {
        setDetails(false);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}><Appbar /><Sidebar /><main className={classes.content}><div className={classes.toolbar} />
                <div className={classes.main}><Typography>Number of Server Running: {zone_reports.length}</Typography><br /><Pagination count={1} /><br />{zone_reports.length > 0 ? zone_reports.map(zone_report =>
                    <Card className={classes.server_card} id={zone_id}>
                        <CardHeader
                            avatar={
                                <img className={classes.server} id={zone_id} src={ServerIcon}></img>
                            }
                            title="Server"
                            subheader="iCAT Server"
                            action={
                                <IconButton
                                    onClick={handleExpandClick}>
                                    <ExpandMoreIcon />
                                </IconButton>
                            }
                        />
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <CardContent>
                                <Typography paragraph>Hostname: {zone_report['icat_server']['host_system_information']['hostname']}</Typography>
                                <Typography paragraph>OS Distribution Name: {zone_report['icat_server']['host_system_information']['os_distribution_name']}</Typography>
                                <Typography paragraph>OS Distribution Version: {zone_report['icat_server']['host_system_information']['os_distribution_version']}</Typography>
                                <Button onClick={viewDetails} color="primary">Details</Button>
                            </CardContent>
                            {details == true ? <Dialog open={details} onClose={closeDetails}>
                                <DialogTitle>Server Details</DialogTitle>
                                <DialogContent>
                                    <Typography>Schema Name: {curr_zone['host_access_control_config']['schema_name']}</Typography>
                                    <Typography>Schema Version: {curr_zone['host_access_control_config']['schema_version']}</Typography>
                                </DialogContent>
                            </Dialog> : <span />}
                        </Collapse>
                    </Card>
                ) : <div><CircularProgress /> Loading...</div>}</div></main>

            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>
            }
        </div >
    );
}

export default Home;
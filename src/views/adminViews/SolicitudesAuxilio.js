import React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Icon,
    IconButton
 } from '@material-ui/core';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    Button,
    Modal,
    Card,
    Badge
} from 'reactstrap'

function ModalResponse(props){
    return(
        <Modal
            className="modal-dialog-centered"
            isOpen={props.defaultModal}
            toggle={props.toggleModal}
        >
            <div className="modal-header">
            <h4 className="modal-title" id="modal-title-default">
                Solicitud de auxilio
            </h4>
            <button
                aria-label="Close"
                className="close"
                data-dismiss="modal"
                type="button"
                onClick={props.toggleModal}
            >
                <span aria-hidden={true}>×</span>
            </button>
            </div>
            <div className="modal-body">
            <p className="mb-0">
                <strong>Fecha:</strong> {props.seleccionado.fecha}
            </p>
            <p className="mb-0">
                <strong>Hora:</strong> {props.seleccionado.hora}
            </p>
            <p className="mb-0">
                <strong>Cliente:</strong> {props.seleccionado.cliente}
            </p>
            <p className="mb-0">
                <strong>Teléfono:</strong> {props.seleccionado.contacto}
            </p>
            <p className="mb-3">
                <strong>Distrito:</strong> {props.seleccionado.distrito}
            </p>
            <iframe title="mapa" id="mapa" src={`https://maps.google.com/maps?q=${props.seleccionado.gpsLat},${props.seleccionado.gpsLong}&z=15&output=embed`} width="100%" height="300" style={{border:0+"px"}} aria-hidden="false"></iframe>
            <p className="description"><strong>Referencia: </strong>{props.seleccionado.referencia}</p>
            <div className="table-responsive-sm mt-3">
            <table className="table table-sm w-auto" >
                <thead>
                    <tr>
                        <th>Falla</th>
                        <th>Costo</th>
                        <th>Causa</th>
                    </tr>
                </thead>
                <tbody className="table-borderless  description mt-3">
                    {
                        JSON.parse(props.seleccionado.fallas_detalle).map((falla,i)=>{
                            return(
                                <tr key={i+"_tr_detalle"}>
                                    <td>{falla.falla}</td>
                                    <td>S/. {parseFloat(falla.costo)}</td>
                                    <td>{falla.causa}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
            <p className="mb-0 text-right">
                <strong>Reparación:</strong> S/. {props.seleccionado.reparacion}
            </p>
            <p className="mb-0 text-right">
                <strong>Asistencia:</strong> S/. {props.seleccionado.asistencia}
            </p>
            <p className="mb-0 text-right">
                <strong>Subtotal:</strong> S/. {props.seleccionado.costo}
            </p>
        </div>
            </div>
            <div className="modal-footer">
            <div className="row">
            <div className="col">
            <Button className="float-left" onClick={()=>props.cambiarEstado(props.seleccionado.idAuxilio, 1)} block color="primary" type="button">
                Enviar mecánico
            </Button>
            <Button className="float-left"  onClick={()=>props.cambiarEstado(props.seleccionado.idAuxilio, 2)} block color="primary" type="button">
                Facturar solicitud
            </Button>
            </div>
            <div className="col">
            <Button className="float-right" onClick={()=>props.cambiarEstado(props.seleccionado.idAuxilio, 3)} block color="danger" type="button">
                Cancelar solicitud
            </Button>
            </div>
            </div>
            </div>
        </Modal>
    );
}

class SolicitudesAuxilio extends React.Component {
    constructor(){
        super();
        this.state={
            solicitudes: [],
            page: 0,
            rowsPerPage: 10,
            seleccionado: null,
            defaultModal: false,
            username: null,
            open: false,
        };
    }
    
    componentWillMount(){
        this.loadData();
    }
    
    loadData = () => {
        fetch(`https://app-5588aec6-1c6c-4e24-93ee-31bb3a4c1c21.cleverapps.io/api/solicitudes-auxilio`, {method: 'POST'})
        .then((response)=>{
            return response.json();
        })
        .then((JSONresponse)=>{
            if(JSONresponse.status == 200){
                this.setState({solicitudes: JSONresponse.data});
                this.setState({open: false});
            }
        })
        .catch(()=>{
            console.clear();
            this.setState({open: true});
            setTimeout(()=>this.loadData(),7000);
        });
    }

    handleChangePage = (event, newPage) => {
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage = (event) => {
        this.setState({rowsPerPage: +event.target.value,page: 0});
    };

    handleClickRow = (e,n) => {
        let solicitud = this.state.solicitudes.slice().find(s=>s.idAuxilio==n);
        this.setState({seleccionado: solicitud}); 
        this.toggleModal();
    }

    toggleModal = () => {
        this.setState({
            defaultModal: !this.state.defaultModal
        });
    };

    cambiarEstado = (_id, estado) =>{
        fetch(`https://app-5588aec6-1c6c-4e24-93ee-31bb3a4c1c21.cleverapps.io/api/solicitudes-auxilio/actualizar-estado/`,{
            method: 'POST',
            body: `{
                "_id": ${_id},
                "state": ${estado}
            }`,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response=>{
            return response.json();
        })
        .then(JSONresponse=>{
            if(JSONresponse.status==200){
                this.setState({open: false});
                this.loadData();
                this.toggleModal();
            }
        })
        .catch(()=>{
            console.clear();
            this.setState({open: true});
            setTimeout(()=>this.cambiarEstado(_id, estado),7000);
        });
    }

//hover style={{"cursor": "pointer"}}
    render(){
        return(
            <>
        <Backdrop open={this.state.open} style={{"position": "fixed", "zIndex": 5}}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <div className="row py-3 align-items-center text-white  animate__animated animate__fadeInDown animate__fast">
            <div className="col">
            <h1 className="display-4 mb-0 text-white">SOLICITUDES DE AUXILIO</h1>
            </div>
        </div>
        <Card className="animate__animated animate__fadeInDown animate__fast">
            <TableContainer>
                <Table stickyHeader className="table-responsive text-nowrap">
                    <TableHead>
                    <TableRow>
                        <TableCell>
                        <strong> Fecha </strong>
                        </TableCell>
                        <TableCell>
                        <strong>Hora</strong>
                        </TableCell>
                        <TableCell>
                        <strong>Cliente</strong>
                        </TableCell>
                        <TableCell>
                        <strong>Teléfono</strong>
                        </TableCell>
                        <TableCell>
                        <strong>Distrito</strong>
                        </TableCell>
                        <TableCell>
                        <strong>Costo</strong>
                        </TableCell>
                        <TableCell>
                        <strong>Estado</strong>
                        </TableCell>
                        <TableCell>
                        <strong>Detalle</strong>
                        </TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        this.state.solicitudes.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((solicitud, i)=>{
                            var color = "primary";
                            switch (solicitud.estado.toLowerCase()) {
                                case 'pendiente':
                                    color="warning";
                                    break;
                                case 'en camino':
                                    color="info";
                                    break;
                                case 'cancelado':
                                    color="danger";
                                    break;
                                case 'facturado':
                                    color="success";
                                    break;
                            }
                            return(
                                <TableRow  key={i+"_tr"} tabIndex={-1}>
                                    <TableCell>
                                        {solicitud.fecha}
                                    </TableCell>
                                    <TableCell>
                                        {solicitud.hora}
                                    </TableCell>
                                    <TableCell>
                                        {solicitud.cliente}
                                    </TableCell>
                                    <TableCell>
                                        {solicitud.contacto}
                                    </TableCell>
                                    <TableCell>
                                        {solicitud.distrito}
                                    </TableCell>
                                    <TableCell>
                                        S/. {solicitud.costo}
                                    </TableCell>
                                    <TableCell>
                                    <Badge className="text-uppercase" color={color} pill>
                                        {solicitud.estado}
                                    </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={(event) => this.handleClickRow(event, solicitud.idAuxilio)} fontSize="small" aria-label="detalles" color="primary" component="span">
                                            <Icon className="fa fa-eye" fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>          
                            );
                        })
                    }
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
            component="div"
            labelRowsPerPage="Mostrar:"
            count={this.state.solicitudes.length}
            rowsPerPage={this.state.rowsPerPage}
            page={this.state.page}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
        
        </Card>
        {this.state.seleccionado ? 
        <ModalResponse cambiarEstado={this.cambiarEstado} defaultModal={this.state.defaultModal} seleccionado={this.state.seleccionado} toggleModal={this.toggleModal}/> : ""}
            </>
        );
    }

}



export default SolicitudesAuxilio;
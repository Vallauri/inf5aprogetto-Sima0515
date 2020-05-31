"option strict"
$(document).ready(function () {

    let idCond = sessionStorage.getItem("idCond");
    let cFiscale = sessionStorage.getItem("codiceFiscale");
    alert("idCondominio: " + idCond + " Codice Fiscale: " + cFiscale);

    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisNameC", "POST", parCod);
    
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        
    });
    name.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);

    });

    let parCon ={
        idCondominio: parseInt(idCond)
    }

    let nomeCondominio = inviaRichiesta("/api/thisNameCondominio", "POST", parCon);
    
    nomeCondominio.done(function (data){
        $("#txtNomeCondominio").text("Condominio " + data[0].nomeCondominio);
    });
    nomeCondominio.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);

    });


    $("#btnLogout").on("click", function () {
		let logoutRQ = inviaRichiesta('/api/logout', 'POST', {});
            logoutRQ.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 401) {
                }
                else {
                    error(jqXHR, test_status, str_error);
                }
            });
            logoutRQ.done(function (data) {
                window.location.href = "../index.html";
            });
    });

    let data = new Date()

    let giorno = data.getDate();
    let mese = data.getMonth() + 1;
    let anno = data.getFullYear();
    $("#giorno").text(giorno + "-");
    $("#mese").text(mese + "-");
    $("#anno").text(anno);
    
        
});

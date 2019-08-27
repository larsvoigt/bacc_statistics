function deleteReport(id) {

    if (!confirm("Are you sure you want to delete this report?"))
        return;

    $.ajax({url: window.location.href + "delete", data: {"id": id}})
        .done(function (res) {
            alert(res);
            location.reload();
        })
        .fail(function (e) {
            alert("Oops something goes wrong " + e);
        });
}

$(document).ready(function() {
    // $('#table').DataTable({
    //     order: [[3, "desc"]]
    // });
} );
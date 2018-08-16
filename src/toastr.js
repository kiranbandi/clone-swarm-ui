import toastr from 'toastr';
import 'toastr/build/toastr.css';

// setting default options 
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "1000000",
    "hideDuration": "1000000",
    "timeOut": "1000000",
    "extendedTimeOut": "1000000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

export default toastr;
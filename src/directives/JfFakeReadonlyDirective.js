const Vue = window.Vue;

Vue.directive('jf-fake-readonly', {
    bind: function(el) {
        $(el).attr('readonly', true);

        let removeAttr = () => {
            $(el).attr('readonly', false);
            $(el).off('focus', removeAttr);
        }

        $(el).on('focus', removeAttr);
    }
})

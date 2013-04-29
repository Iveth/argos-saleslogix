define('spec/Fields/AddressField.spec', [
       'Mobile/SalesLogix/Fields/AddressField'
], function(AddressField) {
    return describe('Mobile/SalesLogix/Fields/AddressField', function() {
        it('can set text', function() {
            var field = new AddressField();
            field.setText('test');
            expect(field.inputNode.innerHTML).toEqual('test');
        });
    });
});


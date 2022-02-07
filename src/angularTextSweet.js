const ngSweet = {
    'testBedImport': "import { ComponentFixture, TestBed } from '@angular/core/testing';",
    'functionTest': `\tit('should test @functionname@', () => {
        expect(component.@functionname@()).toBeTruthy();
    });`,
}

module.exports = ngSweet;
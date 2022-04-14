const { Module } = require("esprima");

const testbody = {
    imports: `it(\`should test @functionName@ with valid inpits\`, () => {
            const fixture = TestBed.createComponent(@className@);
            const @className@_obj = fixture.componentInstance;
            expect(app.title).toEqual('ngWorkBase');
        });`,
    functionBed_truefalse: `it(\`should test @functionName@ :: case-@iteration@ \`, () => {
            const fixture = TestBed.createComponent(@className@);
            const @className@_obj = fixture.componentInstance;
            let exRes = @className@_obj.@functionName@(@params@);
            exRes = (exRes === false) ? true : exRes;
            expect(exRes).toEqual(true);
        });`,
    functionBed_any: `it(\`should test @functionName@ :: case-@iteration@ \`, () => {
            const fixture = TestBed.createComponent(@className@);
            const @className@_obj = fixture.componentInstance;
            let exRes:any = @className@_obj.@functionName@(@params@);
            @aditionalcheck@
            if(exRes !== "Error") {
                exRes = typeof exRes;
            }
            expect(exRes).toEqual('@expected@');
        });`,
    functionBed_default: `it(\`should test @functionName@ :: case-@iteration@ \`, () => {
        const fixture = TestBed.createComponent(@className@);
        const @className@_obj = fixture.componentInstance;
        let exRes:any = @className@_obj.@functionName@(@params@);
        @aditionalcheck@
        if(exRes !== "Error") {
            exRes = typeof exRes;
        }
        expect(exRes).toEqual('@expected@');
    });`,
}

module.exports = testbody;

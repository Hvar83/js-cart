const chai = require('chai');
chai.use(require('chai-dom'))
const { JSDOM } = require("jsdom");

describe("updateMsg", function() {
    let jsdom;
    before(async function() {
      jsdom = await JSDOM.fromFile("./public/index.html", {
        resources: "usable",
        runScripts: "dangerously"
      });
      await new Promise(resolve =>
        jsdom.window.addEventListener("DOMContentLoaded", resolve)
      );
    });
  
    it('Button cart exists', function() {
        chai.expect(jsdom.window.document.getElementById('cart-button')).to.have.class('cart-button');
    });

    it('List elements exists', function() {
        chai.expect(jsdom.window.document.querySelector('.list-items')).not.to.be.empty;
    });
  });

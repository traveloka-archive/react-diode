import { describe, it } from 'mocha';
import chai from 'chai';
import { render } from 'enzyme';
import React from 'react';
import { create } from '../../src/container/DiodeRootContainer';
import DiodeRootQuery from '../../src/query/DiodeRootQuery';

chai.should();

const Component = props => {
  return <div className='test-component' />;
};
Component.displayName = 'TestComponent';

describe('DiodeRootContainer', () => {
  it('should be the same as DiodeContainer with slight difference', () => {
    const Container = create(Component);

    // same as DiodeContainer
    (typeof Container.setWrapperInfo).should.be.equal('function');
    (typeof Container.getWrapperInfo).should.be.equal('function');
    Container.componentName.should.be.equal('TestComponent');
    Container.displayName.should.be.equal('Diode(TestComponent)');

    // the difference
    Container.query.should.be.instanceof(DiodeRootQuery);
  });

  it('should render normally', () => {
    const Container = create(Component);
    const c = render(<Container />);
    c.find('.test-component').should.have.length(1);
    c.html().should.be.equal('<div class="test-component"></div>');
  });
});

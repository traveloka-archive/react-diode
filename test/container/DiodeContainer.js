import { describe, it } from 'mocha';
import { render } from 'enzyme';
import React from 'react';
import chai from 'chai';
import { create } from '../../src/container/DiodeContainer';
import DiodeContainerQuery from '../../src/query/DiodeContainerQuery';

chai.should();

const Component = props => {
  return <div className='test-component' />;
};
Component.displayName = 'TestComponent';

describe('DiodeContainer', () => {
  it('should compose component and queries', () => {
    const Container = create(Component, {
      queries: {
        hello: {
          fragmentStructure: {
            world: null
          }
        }
      }
    });
    Container.query.should.be.instanceof(DiodeContainerQuery);
    Container.displayName.should.be.equal('Diode(TestComponent)');
    Container.componentName.should.be.equal('TestComponent');
  });

  it('should render component normally', () => {
    const Container = create(Component);
    const c = render(<Container />);
    c.find('.test-component').should.have.length(1);
  });

  it('should render wrapperInfo', () => {
    const Container = create(Component, {
      wrapperInfo: {
        className: 'wrapper wrapper-small',
        'data-blocks-id': 1,
        'data-blocks-type': 'block'
      }
    });
    const c = render(<Container />);
    c.find('.wrapper.wrapper-small').should.have.length(1);
    c.find('.test-component').should.have.length(1);
  });

  it('should be able to set wrapperInfo', () => {
    const Container = create(Component, {
      wrapperInfo: { className: 'wrapper-old' }
    });
    Container.setWrapperInfo({
      className: 'wrapper-new'
    });
    const c = render(<Container />);
    c.find('.wrapper-old').should.have.length(0);
    c.find('.wrapper-new').should.have.length(1);
  });

  it('should be able to get wrapperInfo', () => {
    const Container = create(Component, {
      wrapperInfo: { 'data-x-y': 'value' }
    });
    const xy = Container.getWrapperInfo('data-x-y');
    xy.should.be.equal('value');
  });
});

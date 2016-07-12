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
          type: 'HelloQuery',
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

  it('should be able to override wrapperInfo via props', () => {
    const Container = create(Component, {
      wrapperInfo: {
        className: 'wrapper wrapper-small',
        'data-blocks-id': 1,
        'data-blocks-type': 'block'
      }
    });
    const wrapperInfoFromProps = {
      className: 'new-wrapper'
    };
    const c = render(<Container wrapperInfo={wrapperInfoFromProps} />);
    c.find('.wrapper.wrapper-small').should.have.length(0);
    c.find('.new-wrapper').should.have.length(1);
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

  it('should be able to get original component', () => {
    const Container = create(Component);
    Container.getComponent().should.be.deep.equal(Component);
  });

  it('should be able to get component children', () => {
    const ChildContainer = create(Component, {
      queries: {
        hello: {
          type: 'HelloQuery',
          fragmentStructure: {
            x: 'y'
          }
        }
      }
    });
    const Container = create(Component, {
      children: [ChildContainer]
    });
    Container.getChildren().should.be.deep.equal([ChildContainer]);
  });

  it('should return empty array if no children defined in spec', () => {
    const Container = create(Component);
    Container.getChildren().should.be.deep.equal([]);
  });
});

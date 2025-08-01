import React from 'react';
import { render, screen } from '../../test-utils';
import Card, { CardHeader, CardBody, CardFooter } from './Card';

describe('Card Component', () => {
  test('renders card with default props', async () => {
    await render(<Card>Card content</Card>, { withMemoProvider: false });

    const card = screen.getByTestId('card');

    // Check content
    expect(card).toHaveTextContent('Card content');

    // Check default classes
    expect(card).toHaveClass('card');
  });

  test('renders card with custom className', async () => {
    await render(<Card className="custom-class">Card content</Card>, { withMemoProvider: false });

    const card = screen.getByTestId('card');

    // Check classes
    expect(card).toHaveClass('card');
    expect(card).toHaveClass('custom-class');
  });

  test('renders card with header, body, and footer', async () => {
    await render(
      <Card>
        <CardHeader>Header content</CardHeader>
        <CardBody>Body content</CardBody>
        <CardFooter>Footer content</CardFooter>
      </Card>,
      { withMemoProvider: false }
    );

    const card = screen.getByTestId('card');
    const header = screen.getByTestId('card-header');
    const body = screen.getByTestId('card-body');
    const footer = screen.getByTestId('card-footer');

    // Check content
    expect(header).toHaveTextContent('Header content');
    expect(body).toHaveTextContent('Body content');
    expect(footer).toHaveTextContent('Footer content');

    // Check classes
    expect(header).toHaveClass('card-header');
    expect(body).toHaveClass('card-body');
    expect(footer).toHaveClass('card-footer');

    // Check structure
    expect(card).toContainElement(header);
    expect(card).toContainElement(body);
    expect(card).toContainElement(footer);
  });

  test('renders CardHeader with custom className', async () => {
    await render(<CardHeader className="custom-header-class">Header content</CardHeader>, {
      withMemoProvider: false,
    });

    const header = screen.getByTestId('card-header');

    // Check classes
    expect(header).toHaveClass('card-header');
    expect(header).toHaveClass('custom-header-class');
  });

  test('renders CardBody with custom className', async () => {
    await render(<CardBody className="custom-body-class">Body content</CardBody>, {
      withMemoProvider: false,
    });

    const body = screen.getByTestId('card-body');

    // Check classes
    expect(body).toHaveClass('card-body');
    expect(body).toHaveClass('custom-body-class');
  });

  test('renders CardFooter with custom className', async () => {
    await render(<CardFooter className="custom-footer-class">Footer content</CardFooter>, {
      withMemoProvider: false,
    });

    const footer = screen.getByTestId('card-footer');

    // Check classes
    expect(footer).toHaveClass('card-footer');
    expect(footer).toHaveClass('custom-footer-class');
  });
});

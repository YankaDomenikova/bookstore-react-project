export default function QuantityText({ quantity }) {
    return (
        <>
            {quantity === 0 ? <p style={{ color: '#D40101' }}>Out of stock</p>
                : quantity < 6
                    ? <p style={{ color: '#C07A12' }}>Limited quantity</p>
                    : <p style={{ color: '#338525' }}>In stock</p>}
        </>
    );
}
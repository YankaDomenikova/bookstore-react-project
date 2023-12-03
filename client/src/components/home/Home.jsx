import styles from './Home.module.css'

export default function Home() {
    return (
        <div>
            <div className={styles.container}>
                <h1>Home Page</h1>
                <button>Shop now</button>
            </div>
        </div>
    );
}
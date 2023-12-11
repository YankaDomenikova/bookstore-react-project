export const calculate = (ratings) => {
    let oneStars, twoStars, threeStars, fourStars, fiveStars ;
    oneStars = twoStars = threeStars = fourStars = fiveStars = 0;

    let totalCount = ratings.length;
    let sum  = 0;

    ratings.forEach(function (rating) {     
        switch (rating) {
            case 1:
                oneStars++;
                break;
            case 2:
                twoStars++;
                break;
            case 3:
                threeStars++;
                break;
            case 4:
                fourStars++;
                break;
            case 5:
                fiveStars++;
                break; 
            default:
                break;
        }
    });

    sum = 1 * oneStars + 2 * twoStars + 3 * threeStars + 4 * fourStars + 5 * fiveStars;
    return sum / totalCount;
 
}
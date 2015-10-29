/*
    "Roller Coaster" queue problem

    Given a roller coaster with a given number of SEATS per ride, and a queue of N groups of [1-SEATS] people waiting to ride,
        a LIMIT of total rides the roller coaster can run before it needs maintenance,
        and assuming that all groups in the queue must ride together and will block the rest of the queue until there is enough space,
        and will re-enter the queue in exactly the same order after exiting the ride,
        and each person pays $1 per ride...

    ...find how much money roller coaster will make before it must shut down for maintenance.

    This efficient solution simply maintains two indices, where the nextIndex is the next group waiting to ride,
        and rideIndex tells us where our nextIndex iteration must stop. If we still have space in the ride for
        the next group, advance our index, and continue until we have no more seats or we end up where we started.
        Then, just tally up how many seats were filled per ride, and continue loading rides until we are at the limit.
*/
var inputs = readline().split(' '),
    SEATS = parseInt(inputs[0]),
    RIDE_LIMIT = parseInt(inputs[1]),
    N_GROUPS = parseInt(inputs[2]),
    ridesTaken = 0,
    $spent = 0,
    seatsRemaining = SEATS,
    groups = [],
    nextIndex = 0,
    resetIndex;

for (var i = 0; i < N_GROUPS; i++) {
    groups.push(parseInt(readline()));
}

resetIndex = groups.length; // as long as our next group index is less than this, we can keep loading

while (ridesTaken < RIDE_LIMIT) {
    // queue up the ride until we have no more seats or there are no more groups
    while (nextIndex < groups.length && groups[nextIndex] <= seatsRemaining) {
        seatsRemaining -= groups[nextIndex];
        nextIndex++;
        if (nextIndex == resetIndex) break; // we've exhausted the queue for this ride
        if (nextIndex == groups.length) { // continue from beginning of array
            nextIndex = 0;
        }
    }

    ridesTaken++;
    $spent += SEATS - seatsRemaining;
    seatsRemaining = SEATS;

    // reload queue
    resetIndex = nextIndex;
    if (nextIndex == groups.length) {
        nextIndex = 0;
    }
}

print($spent);